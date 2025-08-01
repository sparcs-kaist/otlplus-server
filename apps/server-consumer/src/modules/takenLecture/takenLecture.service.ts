import { HttpService } from '@nestjs/axios'
import { Inject, Injectable } from '@nestjs/common'
import { REDIS_CLIENT } from '@otl/redis/redis.provider'
import { IScholar } from '@otl/scholar-sync/clients/scholar/IScholar'
import {
  ClassTimeInfo,
  CourseInfo,
  DepartmentInfo,
  ExamtimeInfo,
  LectureInfo,
  ProfessorInfo,
} from '@otl/scholar-sync/domain'
import {
  ServerConsumerTakenLectureRepository,
  TAKENLECTURE_REPOSITORY,
} from '@otl/server-consumer/out/ServerConsumerTakenLectureRepository'
import settings from '@otl/server-consumer/settings'
import { SyncType } from '@prisma/client'
import * as Sentry from '@sentry/nestjs'
import { logger } from '@sentry/nestjs'
import Redis from 'ioredis'
import {
  catchError, from, lastValueFrom, retry, timer,
} from 'rxjs'

import { SyncProgress, SyncSSEMessage } from '@otl/common'
import { SyncStatus } from '@otl/common/enum/sync'

import {
  EDepartment, ELecture, EProfessor, ETakenLecture,
} from '@otl/prisma-client'

@Injectable()
export class TakenLectureService {
  constructor(
    @Inject(TAKENLECTURE_REPOSITORY)
    private readonly syncRepository: ServerConsumerTakenLectureRepository,
    private readonly httpService: HttpService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async syncScholarDB(data: IScholar.ScholarDBBody) {
    const staffProfessor = await this.syncRepository.getOrCreateStaffProfessor()
    const existingDepartments = await this.syncRepository.getExistingDepartments()
    const departmentMap: Record<number, EDepartment.Basic> = Object.fromEntries(
      existingDepartments.map((dept) => [dept.id, dept]),
    )
    const processedDepartmentIds = new Set<number>()
    for (const lecture of data.lectures) {
      try {
        if (processedDepartmentIds.has(lecture.DEPT_ID)) continue // skip if already processed
        processedDepartmentIds.add(lecture.DEPT_ID)

        const departmentInfo = DepartmentInfo.deriveDepartmentInfo(lecture)
        const foundDepartment = departmentMap[lecture.DEPT_ID]

        // No department found, create new department
        if (!foundDepartment) {
          const newDept = await this.syncRepository.createDepartment(departmentInfo)
          departmentMap[newDept.id] = newDept

          const deptsToMakeInvisible = existingDepartments.filter((l) => l.code === newDept.code && l.visible)
          await Promise.all(
            deptsToMakeInvisible.map((l) => this.syncRepository.updateDepartment(l.id, { visible: false })),
          )
        }
        else if (!DepartmentInfo.equals(departmentInfo, foundDepartment)) {
          const updated = await this.syncRepository.updateDepartment(foundDepartment.id, {
            num_id: departmentInfo.num_id,
            code: departmentInfo.code,
            name: departmentInfo.name,
            name_en: departmentInfo.name_en,
          })
          departmentMap[foundDepartment.id] = updated
        }
      }
      catch (e: any) {
        Sentry.logger.error(e)
      }
    }

    const lectureByCode = new Map(data.lectures.map((l) => [l.SUBJECT_NO, l] as const))
    const existingCourses = await this.syncRepository.getExistingCoursesByNewCodes(Array.from(lectureByCode.keys()))
    const courseMap = new Map(existingCourses.map((l) => [l.new_code, l] as const))
    for (const [new_code, lecture] of lectureByCode.entries()) {
      try {
        const foundCourse = courseMap.get(new_code)
        const derivedCourse = CourseInfo.deriveCourseInfo(lecture)
        if (!foundCourse) {
          const newCourse = await this.syncRepository.createCourse(derivedCourse)
          courseMap.set(new_code, newCourse)
        }
        else if (!CourseInfo.equals(derivedCourse, foundCourse)) {
          const updatedCourse = await this.syncRepository.updateCourse(foundCourse.id, derivedCourse)
          courseMap.set(new_code, updatedCourse)
        }
      }
      catch (e: any) {
        Sentry.logger.error(e)
      }
    }

    // Professor update
    const professorSyncResultDetail: {
      type: SyncType
      created: EProfessor.Basic[]
      updated: EProfessor.Basic[][]
      deleted: EProfessor.Basic[]
      skipped: EProfessor.Basic[]
      errors: Record<string, number>[]
    } = {
      type: SyncType.PROFESSOR,
      created: [],
      updated: [],
      deleted: [],
      skipped: [],
      errors: [],
    }
    const existingProfessors = await this.syncRepository.getExistingProfessorsById(data.charges.map((c) => c.PROF_ID))
    const professorMap = new Map(existingProfessors.map((p) => [p.professor_id, p]))
    const processedProfessorIds = new Set<number>()
    for (const charge of data.charges) {
      try {
        // TODO: 아래 로직 변경 필요할 수 있음? id는 staff id인데 실제 강사 이름이 들어있음. 데이터에서 staff id 830으로 확인 바람.
        if (charge.PROF_ID === staffProfessor.professor_id) continue
        if (processedProfessorIds.has(charge.PROF_ID)) continue
        processedProfessorIds.add(charge.PROF_ID)

        const professor = professorMap.get(charge.PROF_ID)
        const derivedProfessor = ProfessorInfo.deriveProfessorInfo(charge)

        if (!professor) {
          const newProfessor: EProfessor.Basic = await this.syncRepository.createProfessor(derivedProfessor)
          professorMap.set(charge.PROF_ID, newProfessor)
          professorSyncResultDetail.created.push(newProfessor)
        }
        else if (!ProfessorInfo.equals(professor, derivedProfessor)) {
          const updatedProfessor = await this.syncRepository.updateProfessor(professor.id, derivedProfessor)
          professorMap.set(charge.PROF_ID, updatedProfessor)
          professorSyncResultDetail.updated.push([professor, updatedProfessor])
        }
      }
      catch (e: any) {
        professorSyncResultDetail.errors.push({
          prof_id: charge.PROF_ID,
          error: e.message || 'Unknown error',
        })
      }
    }

    /// Lecture update
    const existingLectures = await this.syncRepository.getExistingDetailedLectures({
      year: data.year,
      semester: data.semester,
    })
    const existingLectureMap = new Map<string, ELecture.Details>()
    for (const l of existingLectures) {
      const key = `${l.new_code}::${l.class_no.trim()}`
      existingLectureMap.set(key, l)
    }
    const chargeMap = new Map<string, IScholar.ScholarChargeType[]>()

    for (const c of data.charges) {
      const key = `${c.LECTURE_YEAR}::${c.LECTURE_TERM}::${c.SUBJECT_NO}::${c.LECTURE_CLASS.trim()}`
      if (!chargeMap.has(key)) {
        chargeMap.set(key, [])
      }
      chargeMap.get(key)!.push(c)
    }
    const notExistingLectures = new Set(existingLectures.map((l) => l.id))
    for (const lecture of data.lectures) {
      try {
        const lectureKey = `${lecture.SUBJECT_NO}::${lecture.LECTURE_CLASS.trim()}`
        const foundLecture = existingLectureMap.get(lectureKey)
        const course_id = courseMap.get(lecture.SUBJECT_NO)?.id
        if (!course_id) throw new Error(`Course not found for lecture ${lecture.SUBJECT_NO}`)
        const derivedLecture = LectureInfo.deriveLectureInfo(lecture, course_id)
        const key = `${lecture.LECTURE_YEAR}::${lecture.LECTURE_TERM}::${lecture.SUBJECT_NO}::${lecture.LECTURE_CLASS.trim()}`
        const professorCharges = chargeMap.get(key) ?? []
        if (foundLecture) {
          notExistingLectures.delete(foundLecture.id)
          if (!LectureInfo.equals(foundLecture, derivedLecture)) {
            await this.syncRepository.updateLecture(foundLecture.id, derivedLecture)
          }
        }
        else {
          const newLecture = await this.syncRepository.createLecture(derivedLecture)
          const addedIds = professorCharges.map((charge) => professorMap.get(charge.PROF_ID)!.id)

          await this.syncRepository.updateLectureProfessors(newLecture.id, {
            added: addedIds,
            removed: [],
          })
        }
      }
      catch (e: any) {
        Sentry.logger.error(e)
      }
    }

    // Remove not existing lectures
    try {
      await this.syncRepository.markLecturesDeleted(Array.from(notExistingLectures))
    }
    catch (e: any) {
      Sentry.logger.error(e)
    }
  }

  async syncExamTime(data: IScholar.ExamtimeBody) {
    return this.syncTime(
      data.year,
      data.semester,
      data.examtimes,
      SyncType.EXAMTIME,
      ExamtimeInfo.deriveExamtimeInfo,
      ExamtimeInfo.equals,
    )
  }

  async syncClassTime(data: IScholar.ClasstimeBody) {
    return this.syncTime(
      data.year,
      data.semester,
      data.classtimes,
      SyncType.CLASSTIME,
      ClassTimeInfo.deriveClasstimeInfo,
      ClassTimeInfo.equals,
    )
  }

  async syncTime<
    TYPE extends typeof SyncType.EXAMTIME | typeof SyncType.CLASSTIME,
    T extends TYPE extends typeof SyncType.EXAMTIME ? IScholar.ScholarExamtimeType : IScholar.ScholarClasstimeType,
    D extends TYPE extends typeof SyncType.EXAMTIME ? ExamtimeInfo : ClassTimeInfo,
  >(
    year: number,
    semester: number,
    data: T[],
    type: TYPE,
    deriveInfo: (time: T) => D,
    matches: (derivedTime: D, existingTime: any) => boolean,
  ) {
    const existingLectures = await this.syncRepository.getExistingDetailedLectures({
      year,
      semester,
    })

    const lecturePairMap = new Map<number, [ELecture.Details, T[]]>(existingLectures.map((l) => [l.id, [l, []]]))

    for (const time of data) {
      const lecture = existingLectures.find(
        (l) => l.code === time.SUBJECT_NO && l.class_no.trim() === time.LECTURE_CLASS.trim(),
      )
      if (!lecture) {
        continue
      }
      const [, times] = lecturePairMap.get(lecture.id)!
      times.push(time)
    }

    for (const [lecture, times] of lecturePairMap.values()) {
      try {
        const derivedTimes = times.map(deriveInfo)
        const existingTimes = type === SyncType.EXAMTIME ? lecture.subject_examtime : lecture.subject_classtime
        const timesToRemove = []

        for (const existing of existingTimes) {
          const idx = derivedTimes.findIndex((t) => matches(t, existing))
          if (idx === -1) timesToRemove.push(existing.id)
          else derivedTimes.splice(idx, 1) // remove matched time
        }
        const timesToAdd = derivedTimes
        if (type === SyncType.EXAMTIME) {
          await this.syncRepository.updateLectureExamtimes(lecture.id, {
            added: timesToAdd,
            removed: timesToRemove,
          })
        }
        else {
          await this.syncRepository.updateLectureClasstimes(lecture.id, {
            added: timesToAdd as any,
            removed: timesToRemove,
          })
        }
      }
      catch (e: any) {
        Sentry.captureException(e, {
          extra: {
            lectureId: lecture.id,
            type,
            times,
          },
        })
        logger.error(`Error syncing ${type} for lecture ${lecture.id}: ${e.message || 'Unknown error'}`)
      }
    }
  }

  async syncIndividualTakenLecture(
    data: IScholar.TakenLectureBody,
    userId: number,
    sseChannel: string,
    progressKey: string,
    requestId: string,
  ) {
    const existingLectures = await this.syncRepository.getExistingDetailedLectures({
      year: data.year,
      semester: data.semester,
    })
    const user = await this.syncRepository.getExistingTakenLecturesByStudentIds(data.year, data.semester, userId)
    if (!user) {
      throw new Error(
        `User with ID ${userId} not found in the database for year ${data.year} and semester ${data.semester}.`,
      )
    }
    const takenLectures = user.taken_lectures
    const studentPairMap = new Map<number, [ETakenLecture.Basic[], number[]]>()
    studentPairMap.set(userId, [takenLectures, []])

    const lectureMap = new Map<string, ELecture.Basic>()
    for (const l of existingLectures) {
      const key = `${l.new_code}::${l.class_no.trim()}`
      lectureMap.set(key, l)
    }

    for (const attend of data.attend) {
      const lectureKey = `${attend.SUBJECT_NO}::${attend.LECTURE_CLASS.trim()}`
      const lectureId = lectureMap.get(lectureKey)?.id
      if (lectureId) {
        const pair = studentPairMap.get(userId)!
        pair[1].push(lectureId)
      }
    }

    const saveToDB = []
    for (const [_, [existingTakenLectures, attendRecords]] of studentPairMap) {
      try {
        if (attendRecords.length) {
          saveToDB.push(
            ...attendRecords.map((lectureId) => ({
              studentId: parseInt(user.student_id),
              lectureId,
            })),
          )
        }
        const recordIdsToRemove = []
        const recordsToAdd = [...attendRecords]
        for (const existing of existingTakenLectures) {
          const idx = recordsToAdd.indexOf(existing.lecture_id)
          if (idx === -1) recordIdsToRemove.push(existing.id)
          else recordsToAdd.splice(idx, 1)
        }

        if (recordIdsToRemove.length || recordsToAdd.length) {
          await this.updateTakenLectures(
            userId,
            {
              remove: recordIdsToRemove,
              add: recordsToAdd,
            },
            sseChannel,
            progressKey,
            requestId,
          )
        }
      }
      catch (e: any) {
        Sentry.captureException(e, {
          extra: {
            userId,
            year: data.year,
            semester: data.semester,
            attendRecords,
          },
        })
        logger.error(`Error syncing taken lectures for user ${userId}: ${e.message || 'Unknown error'}`)
        throw e
      }
    }

    await this.syncRepository.replaceRawTakenLectures(saveToDB, {
      year: data.year,
      semester: data.semester,
    })
  }

  private async updateTakenLectures(
    userId: number,
    items: { add: number[], remove: number[] },
    sseChannel: string,
    progressKey: string,
    requestId: string,
  ) {
    // 한 번에 처리할 DB 작업 및 업데이트 알림의 묶음 크기
    const BATCH_SIZE = 5

    // 1. 기존 수강 기록 삭제 처리
    for (let i = 0; i < items.remove.length; i += BATCH_SIZE) {
      const chunk = items.remove.slice(i, i + BATCH_SIZE)
      if (chunk.length > 0) {
        // DB에서 레코드 삭제
        await this.syncRepository.deleteTakenLectures(chunk)
        // 진행 상황 업데이트 및 방송
        await this.updateAndBroadcastProgress(progressKey, sseChannel, requestId, chunk.length)
      }
    }

    // 2. 새로운 수강 기록 추가 처리
    for (let i = 0; i < items.add.length; i += BATCH_SIZE) {
      const chunk = items.add.slice(i, i + BATCH_SIZE)
      if (chunk.length > 0) {
        // DB에 추가할 데이터 형태로 변환
        const dataToCreate = chunk.map((lectureId) => ({
          userprofile_id: userId,
          lecture_id: lectureId,
        }))
        // DB에 레코드 생성
        await this.syncRepository.createTakenLectures(dataToCreate)
        // 진행 상황 업데이트 및 방송
        await this.updateAndBroadcastProgress(progressKey, sseChannel, requestId, chunk.length)
      }
    }
  }

  /**
   * Redis에 저장된 진행 상태를 업데이트하고 SSE 채널로 방송하는 헬퍼 메서드
   */
  private async updateAndBroadcastProgress(
    progressKey: string,
    sseChannel: string,
    requestId: string,
    incrementBy: number,
  ) {
    // 원자성을 위해 INCRBY 사용
    await this.redis.hincrby(progressKey, 'completed', incrementBy)

    // 현재 progress 객체를 다시 가져와서 SSE 메시지 생성
    const progressData = await this.redis.hgetall(progressKey)
    const progress: SyncProgress = {
      status: progressData.status as SyncStatus,
      total: parseInt(progressData.total),
      completed: parseInt(progressData.completed),
      startedAt: new Date(progressData.startedAt),
    }

    const sseMessage: SyncSSEMessage = {
      requestId,
      progress,
      message: `Syncing... ${progress.completed} / ${progress.total}`,
    }

    await this.redis.publish(sseChannel, JSON.stringify(sseMessage))
  }

  async getIndividualTakenLectureDataSync(
    year: number,
    semester: number,
    studentId: number,
    userId: number,
    requestId: string,
  ) {
    const jobIdentifier = `${userId}:${year}:${semester}`
    const statusKey = `taken-lecture-sync:status:${jobIdentifier}`
    const progressKey = `taken-lecture-sync:progress:${requestId}`
    const sseChannel = `sync-progress:${requestId}`

    console.log(`[Consumer 1] Triggering data fetch for student ${studentId}, requestId: ${requestId}`)
    const { host } = settings().getScholarSyncInfo()
    if (!host) {
      throw new Error('Scholar Sync host is not configured')
    }
    const url = `${host}/api/dynamic-sync/individual-takenLecture`
    const request$ = from(
      this.httpService.post(url, {
        year,
        semester,
        studentId,
        userId,
        requestId,
      }),
    ).pipe(
      retry({
        count: 3,
        delay: (error, retryCount) => {
          const delayMs = 5000 * retryCount
          console.warn(
            `[Consumer 1] Retrying trigger for ${requestId}, attempt #${retryCount}. Error: ${error.message}`,
          )
          return timer(delayMs)
        },
      }),
      catchError((err) => {
        console.error(`[Consumer 1] Permanently failed to trigger sync for ${requestId}`, err.message)
        const errorProgress = { status: SyncStatus.Error, error: `Trigger failed: ${err.message}` }
        const fifteenMinutesInSeconds = 90

        return from(
          (async () => {
            await this.redis.hmset(progressKey, errorProgress)
            await this.redis.expire(statusKey, fifteenMinutesInSeconds)
            await this.redis.expire(progressKey, fifteenMinutesInSeconds)
            await this.redis.publish(sseChannel, JSON.stringify(errorProgress))
            return null
          })(),
        )
      }),
    )

    const result = await lastValueFrom(request$)
    console.log(result)

    if (result) {
      console.log(`[Consumer 1] Successfully triggered sync for ${requestId}. Waiting for data from sync-server.`)
    }
  }

  async syncIndividualTakenLectureAndBroadCast(
    requestId: string,
    lectureData: IScholar.ScholarDBBody,
    classtimeData: IScholar.ClasstimeBody,
    examTimeData: IScholar.ExamtimeBody,
    takenLectureData: IScholar.TakenLectureBody,
    studentId: number,
    userId: number,
    year: number,
    semester: number,
  ) {
    try {
      const progressKey = `taken-lecture-sync:progress:${requestId}`
      const sseChannel = `sync-progress:${requestId}`

      console.log(`[Consumer 2] Starting data processing for requestId: ${requestId}`)

      // 1. 상태를 '진행 중'으로 업데이트
      const progressData = await this.redis.hgetall(progressKey)
      if (!progressData || Object.keys(progressData).length === 0) {
        throw new Error(`Progress key not found for requestId: ${requestId}`)
      }
      // ✨ 수정됨: hgetall 결과를 파싱
      const progress = this.parseProgress(progressData)!

      // 1. 상태를 '진행 중'으로 업데이트
      progress.status = SyncStatus.InProgress
      progress.total = takenLectureData.attend.length
      progress.completed = 0

      // ✨ 수정됨: .set() 대신 .hmset() 사용
      await this.redis.hmset(progressKey, {
        status: progress.status,
        total: progress.total,
        completed: progress.completed,
      })

      let sseMessage: SyncSSEMessage = { requestId, progress, message: 'Sync started' }
      await this.redis.publish(sseChannel, JSON.stringify(sseMessage))

      // 2. 각 데이터 타입에 맞춰 순차적으로 동기화 진행
      // 참고 코드로 제공된 SyncService의 메서드들을 활용
      sseMessage = { ...sseMessage, message: 'Syncing lectures & courses...' }
      await this.redis.publish(sseChannel, JSON.stringify(sseMessage))
      await this.syncScholarDB(lectureData)

      sseMessage = { ...sseMessage, message: 'Syncing classTimes' }
      await this.redis.publish(sseChannel, JSON.stringify(sseMessage))
      await this.syncClassTime(classtimeData)

      sseMessage = { ...sseMessage, message: 'Syncing examTimes' }
      await this.redis.publish(sseChannel, JSON.stringify(sseMessage))
      await this.syncExamTime(examTimeData)

      sseMessage = { ...sseMessage, message: 'Syncing TakenLectures...' }
      await this.redis.publish(sseChannel, JSON.stringify(sseMessage))
      await this.syncIndividualTakenLecture(takenLectureData, userId, sseChannel, progressKey, requestId)

      // 3. 최종 완료 상태 업데이트
      const finalProgress: SyncProgress = {
        status: 'COMPLETED',
        total: takenLectureData.attend.length,
        completed: takenLectureData.attend.length,
        startedAt: progress.startedAt,
      }
      sseMessage = { ...sseMessage, progress: finalProgress, message: 'Sync TakenLecture Completed' }
      // ✨ 수정됨: 최종 상태를 hset으로 업데이트.
      await this.redis.hset(progressKey, 'status', SyncStatus.Completed)
      await this.redis.publish(sseChannel, JSON.stringify(sseMessage))

      // 2. statusKey를 찾기 위해 jobIdentifier를 만듭니다. (이 정보는 MQ 메시지에 포함되어야 함)
      const jobIdentifier = `${studentId}:${year}:${semester}`
      const statusKey = `taken-lecture-sync:status:${jobIdentifier}`
      await this.redis.expire(progressKey, 30)
      await this.redis.expire(statusKey, 30)

      console.log(`[Consumer 2] Successfully processed data for requestId: ${requestId}`)
    }
    catch (error: any) {
      const jobIdentifier = `${studentId}:${year}:${semester}`
      const statusKey = `taken-lecture-sync:status:${jobIdentifier}`
      const progressKey = `taken-lecture-sync:progress:${requestId}`
      const errorProgress: Partial<SyncProgress> = {
        status: SyncStatus.Error,
      }
      // ✨ 수정됨: 에러 상태를 .hmset으로 업데이트
      await this.redis.hmset(progressKey, errorProgress)
      const fifteenMinutesInSeconds = 900
      await this.redis.expire(progressKey, fifteenMinutesInSeconds)
      await this.redis.expire(statusKey, fifteenMinutesInSeconds)

      logger.error(`Error processing data for requestId ${requestId}, error: ${error.message || 'Unknown error'}`)
    }
  }

  private parseProgress(data: Record<string, string>): SyncProgress | null {
    if (!data || Object.keys(data).length === 0) {
      return null
    }
    return {
      status: data.status as SyncStatus,
      total: parseInt(data.total) || 0,
      completed: parseInt(data.completed) || 0,
      startedAt: new Date(data.startedAt),
      ...(data.error && { error: data.error }),
    }
  }
}
