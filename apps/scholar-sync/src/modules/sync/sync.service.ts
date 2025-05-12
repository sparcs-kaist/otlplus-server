import { Injectable, Logger } from '@nestjs/common'
import { IScholar } from '@otl/scholar-sync/clients/scholar/IScholar'
import { SlackNotiService } from '@otl/scholar-sync/clients/slack/slackNoti.service'
import { ClassTimeInfo } from '@otl/scholar-sync/common/domain/ClassTimeInfo'
import { CourseInfo } from '@otl/scholar-sync/common/domain/CourseInfo'
import { DegreeInfo } from '@otl/scholar-sync/common/domain/DegreeInfo'
import { DepartmentInfo } from '@otl/scholar-sync/common/domain/DepartmentInfo'
import { ExamtimeInfo } from '@otl/scholar-sync/common/domain/ExamTimeInfo'
import { LectureInfo } from '@otl/scholar-sync/common/domain/LectureInfo'
import { APPLICATION_TYPE, MajorInfo } from '@otl/scholar-sync/common/domain/MajorInfo'
import { ProfessorInfo } from '@otl/scholar-sync/common/domain/ProfessorInfo'
import { SyncResultDetail, SyncResultDetails, SyncTimeType } from '@otl/scholar-sync/common/interfaces/ISync'
import { summarizeSyncResult } from '@otl/scholar-sync/modules/sync/util'
import { review_review, SyncType } from '@prisma/client'

import { groupBy, normalizeArray } from '@otl/common/utils/util'

import {
  EDepartment,
  ELecture,
  EProfessor,
  EReview,
  ESemester,
  ETakenLecture,
  EUser,
} from '@otl/prisma-client/entities'
import { SyncRepository } from '@otl/prisma-client/repositories'

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name)

  private readonly BATCH_SIZE = 1000

  private readonly CONCURRENCY_LIMIT = 10

  constructor(
    private readonly syncRepository: SyncRepository,
    private readonly slackNoti: SlackNotiService,
  ) {}

  async getSemesters(take?: number): Promise<ESemester.Basic[]> {
    return await this.syncRepository.getSemesters(take)
  }

  async syncScholarDB(data: IScholar.ScholarDBBody): Promise<SyncResultDetails> {
    await this.slackNoti.sendSyncNoti(
      `syncScholarDB ${data.year}-${data.semester}: ${data.lectures.length} lectures, ${data.charges.length} charges`,
    )
    const result: SyncResultDetails = {
      time: new Date(),
      year: data.year,
      semester: data.semester,
      results: [],
    }

    const departmentSyncResultDetail = new SyncResultDetail(SyncType.DEPARTMENT)
    const staffProfessor = await this.syncRepository.getOrCreateStaffProfessor()

    /// Department update
    /**
     * Temporary Comment out
     * 모든 Department ID가 다 바뀌었는데 어떻게 바뀌었는지 모름.
     * 일단 1/3일 타겟까지는 업데이트하지말고 수강신청 기간 이후에 적절히 수동으로 바꿔줄 수 있도록 할 예정
     * */
    const existingDepartments = await this.syncRepository.getExistingDepartments()
    const departmentMap: Record<number, EDepartment.Basic> = Object.fromEntries(
      existingDepartments.map((dept) => [dept.id, dept]),
    )
    await this.slackNoti.sendSyncNoti(`Found ${existingDepartments.length} existing departments, updating...`)
    const startLog = await this.syncRepository.logSyncStartPoint(SyncType.DEPARTMENT, data.year, data.semester)
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
          departmentSyncResultDetail.created.push(newDept)

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
          departmentSyncResultDetail.updated.push([foundDepartment, updated])
        }
      }
      catch (e: any) {
        departmentSyncResultDetail.errors.push({
          dept_id: lecture.DEPT_ID,
          error: e.message || 'Unknown error',
        })
      }
    }
    await this.slackNoti.sendSyncNoti(
      `Department created: ${departmentSyncResultDetail.created.length}, updated: ${departmentSyncResultDetail.updated.length}, errors: ${departmentSyncResultDetail.errors.length}`,
    )
    const departmentDndTime = new Date()
    await this.syncRepository.logSyncEndPoint(
      startLog.id,
      departmentDndTime,
      summarizeSyncResult(departmentSyncResultDetail),
    )

    /// Course update
    // TODO: OLD_NO may not be available later, need to change to use new code
    // -> SUBJECT_NO(DB의 code 및 new_code) 사용으로 수정
    const courseSyncResultDetail = new SyncResultDetail(SyncType.COURSE)
    const lectureByCode = new Map(data.lectures.map((l) => [l.SUBJECT_NO, l] as const))
    const existingCourses = await this.syncRepository.getExistingCoursesByNewCodes(Array.from(lectureByCode.keys()))
    await this.slackNoti.sendSyncNoti(`Found ${existingCourses.length} existing related courses, updating...`)
    const courseStartLog = await this.syncRepository.logSyncStartPoint(SyncType.COURSE, data.year, data.semester)

    const courseMap = new Map(existingCourses.map((l) => [l.new_code, l] as const))
    for (const [new_code, lecture] of lectureByCode.entries()) {
      try {
        const foundCourse = courseMap.get(new_code)
        const derivedCourse = CourseInfo.deriveCourseInfo(lecture)
        if (!foundCourse) {
          const newCourse = await this.syncRepository.createCourse(derivedCourse)
          courseSyncResultDetail.created.push(newCourse)
          courseMap.set(new_code, newCourse)
        }
        else if (!CourseInfo.equals(derivedCourse, foundCourse)) {
          const updatedCourse = await this.syncRepository.updateCourse(foundCourse.id, derivedCourse)
          courseSyncResultDetail.updated.push([foundCourse, updatedCourse])
          courseMap.set(new_code, updatedCourse)
        }
      }
      catch (e: any) {
        courseSyncResultDetail.errors.push({
          new_code,
          error: e.message || 'Unknown error',
        })
      }
    }
    await this.slackNoti.sendSyncNoti(
      `Course created: ${courseSyncResultDetail.created.length}, updated: ${courseSyncResultDetail.updated.length}, errors: ${courseSyncResultDetail.errors.length}`,
    )
    const courseEndTime = new Date()
    await this.syncRepository.logSyncEndPoint(
      courseStartLog.id,
      courseEndTime,
      summarizeSyncResult(courseSyncResultDetail),
    )

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
    await this.slackNoti.sendSyncNoti(`Found ${existingProfessors.length} existing related professors, updating...`)
    const professorStartLog = await this.syncRepository.logSyncStartPoint(SyncType.PROFESSOR, data.year, data.semester)
    const processedProfessorIds = new Set<number>()
    for (const charge of data.charges) {
      try {
        // TODO: 아래 로직 변경 필요할 수 있음? id는 staff id인데 실제 강사 이름이 들어있음. 데이터에서 staff id 830으로 확인 바람.
        // 기존 코드에서도 이렇게 처리하고 있었음.
        // staff id인 경우 이름이 각자 다를 수 있다는 것임.
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
    await this.slackNoti.sendSyncNoti(
      `Professor created: ${professorSyncResultDetail.created.length}, updated: ${professorSyncResultDetail.updated.length}, errors: ${professorSyncResultDetail.errors.length}`,
    )
    const professorEndTime = new Date()
    await this.syncRepository.logSyncEndPoint(
      professorStartLog.id,
      professorEndTime,
      summarizeSyncResult(professorSyncResultDetail),
    )

    /// Lecture update
    const lecturesSyncResultDetail = new SyncResultDetail(SyncType.LECTURE)
    const chargesSyncResultDetail = new SyncResultDetail(SyncType.CHARGE)
    const existingLectures = await this.syncRepository.getExistingDetailedLectures({
      year: data.year,
      semester: data.semester,
    })
    await this.slackNoti.sendSyncNoti(`Found ${existingLectures.length} existing lectures, updating...`)
    const lectureStartLog = await this.syncRepository.logSyncStartPoint(SyncType.LECTURE, data.year, data.semester)
    const chargeStartLog = await this.syncRepository.logSyncStartPoint(SyncType.CHARGE, data.year, data.semester)
    const notExistingLectures = new Set(existingLectures.map((l) => l.id))
    for (const lecture of data.lectures) {
      try {
        const foundLecture = existingLectures.find(
          (l) => l.new_code === lecture.SUBJECT_NO && l.class_no.trim() === lecture.LECTURE_CLASS.trim(),
        )
        const course_id = courseMap.get(lecture.SUBJECT_NO)?.id
        if (!course_id) throw new Error(`Course not found for lecture ${lecture.SUBJECT_NO}`)
        const derivedLecture = LectureInfo.deriveLectureInfo(lecture, course_id)
        const professorCharges = data.charges.filter(
          (c) => c.LECTURE_YEAR === lecture.LECTURE_YEAR
            && c.LECTURE_TERM === lecture.LECTURE_TERM
            && c.SUBJECT_NO === lecture.SUBJECT_NO
            && c.LECTURE_CLASS.trim() === lecture.LECTURE_CLASS.trim(),
        )

        if (foundLecture) {
          notExistingLectures.delete(foundLecture.id)
          if (LectureInfo.equals(foundLecture, derivedLecture)) {
            const updatedLecture = await this.syncRepository.updateLecture(foundLecture.id, derivedLecture)
            lecturesSyncResultDetail.updated.push([foundLecture, updatedLecture])
          }
          const { addedIds, removedIds } = this.lectureProfessorsChanges(foundLecture, professorCharges, professorMap)

          if (addedIds.length || removedIds.length) {
            await this.syncRepository.updateLectureProfessors(foundLecture.id, {
              added: addedIds,
              removed: removedIds,
            })
            chargesSyncResultDetail.created.push({
              lecture: foundLecture,
              added: addedIds.map((id) => professorMap.get(id)),
            })
            chargesSyncResultDetail.deleted.push({
              lecture: foundLecture.id,
              removed: removedIds.map((id) => professorMap.get(id) || { id }),
            })
          }
        }
        else {
          const newLecture = await this.syncRepository.createLecture(derivedLecture)
          const addedIds = professorCharges.map((charge) => professorMap.get(charge.PROF_ID)!.id)

          await this.syncRepository.updateLectureProfessors(newLecture.id, {
            added: addedIds,
            removed: [],
          })
          lecturesSyncResultDetail.created.push({ ...newLecture, professors: addedIds })
        }
      }
      catch (e: any) {
        lecturesSyncResultDetail.errors.push({
          lecture: {
            code: lecture.SUBJECT_NO,
            class_no: lecture.LECTURE_CLASS,
          },
          error: e.message || 'Unknown error',
        })
      }
    }

    // Remove not existing lectures
    try {
      await this.syncRepository.markLecturesDeleted(Array.from(notExistingLectures))
      lecturesSyncResultDetail.deleted = Array.from(notExistingLectures)
    }
    catch (e: any) {
      lecturesSyncResultDetail.errors.push({
        lecturesToDelete: Array.from(notExistingLectures),
        error: e.message || 'Unknown error',
      })
    }

    await this.slackNoti.sendSyncNoti(
      `Lecture created: ${lecturesSyncResultDetail.created.length}, updated: ${lecturesSyncResultDetail.updated.length}, errors: ${lecturesSyncResultDetail.errors.length}`,
    )
    const lectureEndTime = new Date()
    await this.syncRepository.logSyncEndPoint(
      lectureStartLog.id,
      lectureEndTime,
      summarizeSyncResult(lecturesSyncResultDetail),
    )
    await this.syncRepository.logSyncEndPoint(
      chargeStartLog.id,
      lectureEndTime,
      summarizeSyncResult(chargesSyncResultDetail),
    )
    result.results.push(departmentSyncResultDetail)
    result.results.push(courseSyncResultDetail)
    result.results.push(professorSyncResultDetail)
    result.results.push(lecturesSyncResultDetail)
    result.results.push(chargesSyncResultDetail)
    return result
  }

  lectureProfessorsChanges(
    lecture: ELecture.Details,
    charges: IScholar.ScholarChargeType[],
    professorMap: Map<number, EProfessor.Basic>,
  ): { addedIds: number[], removedIds: number[] } {
    const addedIds = charges
      .filter((charge) => !lecture.subject_lecture_professors.find((p) => p.professor.professor_id === charge.PROF_ID))
      .map((charge) => professorMap.get(charge.PROF_ID)!.id)
    const removedIds = lecture.subject_lecture_professors
      .filter((p) => !charges.find((charge) => charge.PROF_ID === p.professor.professor_id))
      .map((p) => p.professor.id)
    return {
      addedIds: Array.from(new Set(addedIds)),
      removedIds: Array.from(new Set(removedIds)),
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
    TYPE extends SyncTimeType,
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
    const result: SyncResultDetails = {
      time: new Date(),
      year,
      semester,
      results: [],
    }
    await this.slackNoti.sendSyncNoti(`sync ${type} ${year}-${semester}: ${data.length} ${type}s`)
    const startLog = await this.syncRepository.logSyncStartPoint(type, year, semester)
    const timeResultDetail = new SyncResultDetail(type)
    const existingLectures = await this.syncRepository.getExistingDetailedLectures({
      year,
      semester,
    })

    await this.slackNoti.sendSyncNoti(`Found ${existingLectures.length} existing lectures, updating ${type}s...`)
    const lecturePairMap = new Map<number, [ELecture.Details, T[]]>(existingLectures.map((l) => [l.id, [l, []]]))

    for (const time of data) {
      const lecture = existingLectures.find(
        (l) => l.code === time.SUBJECT_NO && l.class_no.trim() === time.LECTURE_CLASS.trim(),
      )
      if (!lecture) {
        timeResultDetail.skipped.push({
          subject_no: time.SUBJECT_NO,
          lecture_class: time.LECTURE_CLASS,
          error: 'Lecture not found',
        })
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

        if (timesToAdd.length > 0 || timesToRemove.length > 0) {
          timeResultDetail.updated.push({
            lecture: lecture.code,
            class_no: lecture.class_no,
            previous: existingTimes,
            added: timesToAdd,
            removed: timesToRemove,
          })
        }
      }
      catch (e: any) {
        timeResultDetail.errors.push({
          lecture: {
            code: lecture.code,
            class_no: lecture.class_no,
          },
          error: e.message || 'Unknown error',
        })
      }
    }

    await this.slackNoti.sendSyncNoti(
      `${type.charAt(0).toUpperCase() + type.slice(1)} updated: ${
        timeResultDetail.updated.length
      }, skipped: ${timeResultDetail.skipped.length}, errors: ${timeResultDetail.errors.length}`,
    )
    const endTime = new Date()
    await this.syncRepository.logSyncEndPoint(startLog.id, endTime, summarizeSyncResult(timeResultDetail))
    result.results.push(timeResultDetail)
    return result
  }

  async syncTakenLecture(data: IScholar.TakenLectureBody) {
    this.slackNoti.sendSyncNoti(
      `syncTakenLecture: ${data.year}-${data.semester}: ${data.attend.length} attend records`,
    )
    const startLog = await this.syncRepository.logSyncStartPoint(SyncType.TAKEN_LECTURES, data.year, data.semester)

    const result: SyncResultDetails = {
      time: new Date(),
      year: data.year,
      semester: data.semester,
      results: [],
    }
    const resultDetail = new SyncResultDetail(SyncType.TAKEN_LECTURES)

    const existingLectures = await this.syncRepository.getExistingDetailedLectures({
      year: data.year,
      semester: data.semester,
    })
    const existingUserTakenLectures = (
      await this.syncRepository.getUserExistingTakenLectures({
        year: data.year,
        semester: data.semester,
      })
    ).filter((u) => !Number.isNaN(parseInt(u.student_id)))
    await this.slackNoti.sendSyncNoti(
      `Found ${existingLectures.length} existing lectures, ${existingUserTakenLectures.length} existing user with taken records`,
    )
    const studentIds = Array.from(
      new Set([
        ...data.attend.map((a) => a.STUDENT_NO),
        ...existingUserTakenLectures.map((u) => parseInt(u.student_id)),
      ]),
    )

    /** 여러 user가 동일한 student_id를 가질 수 있음 (실제로 존재)
     * 따라서 student_id를 key로 하여 [taken_lectures, attend_lecture_ids, userprofile_id]를 저장
     * [0]]: 이미 DB에 저장된 수강 강의 목록. 동일한 student_id 여러 user들이 합쳐져있다.
     * [1]: attend에서 찾은 새로운 lecture_id 목록
     * [2]: student_id에 해당하는 userprofile id 목록
     */
    const studentPairMap = new Map<number, [ETakenLecture.Basic[], number[], number[]]>()

    for (const studentId of studentIds) {
      studentPairMap.set(studentId, [[], [], []])
    }

    for (const user of existingUserTakenLectures) {
      const student_id = parseInt(user.student_id)
      const pair = studentPairMap.get(student_id)!
      pair[0].push(...user.taken_lectures)
    }

    for (const attend of data.attend) {
      const lectureId = this.getLectureIdOfAttendRecord(existingLectures, attend)
      if (lectureId) {
        const pair = studentPairMap.get(attend.STUDENT_NO)!
        pair[1].push(lectureId)
      }
      else {
        resultDetail.errors.push({
          student_no: attend.STUDENT_NO,
          attend,
          error: 'lecture not found',
        })
      }
    }

    const userprofiles = await this.syncRepository.getUserProfileIdsFromStudentIds(studentIds)
    for (const user of userprofiles) {
      const student_id = parseInt(user.student_id)
      const pair = studentPairMap.get(student_id)!
      pair[2].push(user.id)
    }

    const saveToDB = []
    let skipCount = 0
    for (const [studentId, [existingTakenLectures, attendRecords, userprofileIds]] of studentPairMap) {
      try {
        if (attendRecords.length) {
          saveToDB.push(
            ...attendRecords.map((lectureId) => ({
              studentId,
              lectureId,
            })),
          )
        }

        if (userprofileIds.length === 0) {
          // eslint-disable-next-line no-plusplus
          skipCount++
          continue
        }
        for (const userprofileId of userprofileIds) {
          const recordIdsToRemove = []
          const recordsToAdd = [...attendRecords]
          for (const existing of existingTakenLectures.filter((e) => e.userprofile_id === userprofileId)) {
            const idx = recordsToAdd.indexOf(existing.lecture_id)
            if (idx === -1) recordIdsToRemove.push(existing.id)
            else recordsToAdd.splice(idx, 1)
          }

          if (recordIdsToRemove.length || recordsToAdd.length) {
            await this.syncRepository.updateTakenLectures(userprofileId, {
              remove: recordIdsToRemove,
              add: recordsToAdd,
            })
            resultDetail.updated.push({
              studentId,
              remove: recordIdsToRemove.map((id) => existingTakenLectures.find((e) => e.id === id)?.lecture_id),
              add: recordsToAdd,
            })
          }
        }
      }
      catch (e: any) {
        resultDetail.errors.push({ studentId, error: e.message || 'Unknown error' })
      }
    }

    await this.syncRepository.replaceRawTakenLectures(saveToDB, {
      year: data.year,
      semester: data.semester,
    })

    await this.slackNoti.sendSyncNoti(
      `syncTakenLecture: ${resultDetail.updated.length} updated, ${skipCount} skipped, ${resultDetail.errors.length} errors`,
    )
    const endTime = new Date()
    await this.syncRepository.logSyncEndPoint(startLog.id, endTime, summarizeSyncResult(resultDetail))
    result.results.push(resultDetail)

    return result
  }

  getLectureIdOfAttendRecord(lectures: ELecture.Basic[], attend: IScholar.ScholarAttendType) {
    const lecture = lectures.find(
      (l) => l.new_code === attend.SUBJECT_NO && l.class_no === attend.LECTURE_CLASS.trim(),
    )
    return lecture?.id
  }

  async repopulateTakenLectureForStudent(userId: number) {
    const user = await this.syncRepository.getUserWithId(userId)
    if (!user) throw new Error('User not found')
    const studentId = parseInt(user.student_id)
    if (Number.isNaN(studentId)) return // Skip if student_id is not a number
    const rawTakenLectures = await this.syncRepository.getRawTakenLecturesOfStudent(studentId)
    await this.syncRepository.repopulateTakenLecturesOfUser(studentId, rawTakenLectures)
  }

  async updateBestReviews() {
    this.logger.log('Running scheduled job: Update Best Reviews')

    // Process humanity reviews
    const humanityReviews = await this.syncRepository.getHumanityReviews()
    const humanityBestReviews = this.getBestReviews(humanityReviews, 50, 20)

    await this.syncRepository.clearHumanityBestReviews()
    await this.syncRepository.addHumanityBestReviews(humanityBestReviews.map((r) => ({ reviewId: r.id })))

    // Process major reviews
    const majorReviews = await this.syncRepository.getMajorReviews()
    const majorBestReviews = this.getBestReviews(majorReviews, 2000, 1000)

    await this.syncRepository.clearMajorBestReviews()
    await this.syncRepository.addMajorBestReviews(majorBestReviews.map((r) => ({ reviewId: r.id })))

    this.logger.log('BestReview updated by scheduled job')
  }

  private getBestReviews(
    reviews: EReview.WithLectures[],
    minLikedCount: number,
    maxResultCount: number,
  ): review_review[] {
    const likedCount = Math.max(minLikedCount, Math.floor(reviews.length / 10))

    const mostLikedReviews = reviews.sort((a, b) => this.calculateKey(b) - this.calculateKey(a)).slice(0, likedCount)

    const latestDateStart = new Date()
    latestDateStart.setDate(latestDateStart.getDate() - 7)

    const latestReviews = reviews.filter(
      (review) => review.written_datetime && new Date(review.written_datetime) >= latestDateStart,
    )

    const bestCandidateReviews = [...mostLikedReviews, ...latestReviews]
    return bestCandidateReviews.length > maxResultCount
      ? bestCandidateReviews.slice(0, maxResultCount)
      : bestCandidateReviews
  }

  private calculateKey(review: EReview.WithLectures): number {
    const baseYear = new Date().getFullYear()
    const lectureYear = review.lecture.year
    const yearDiff = baseYear - lectureYear > 0 ? baseYear - lectureYear : 0
    return Math.floor((review.like / (review.lecture.audience + 1)) * 0.85 ** yearDiff)
  }

  async syncDegree(data: IScholar.ScholarDegreeType[]) {
    this.slackNoti.sendSyncNoti(`syncDegree: ${data.length} degrees`)
    const startLog = await this.syncRepository.logSyncStartPoint(SyncType.DEGREE, 0, 0)
    const result: SyncResultDetails = {
      time: new Date(),
      year: 0,
      semester: 0,
      results: [],
    }
    const degreeSyncResultDetail = new SyncResultDetail(SyncType.DEGREE)

    // 1. Collect all student numbers and map them to their degree info
    const studentIds = Array.from(new Set(data.map((d) => `${d.STUDENT_NO}`)))
    const studentDegreeMap = normalizeArray<DegreeInfo>(
      data.map((d) => DegreeInfo.deriveDegreeInfo(d)),
      (d) => `${d.student_no}`,
    )

    // 2. Get the users that already exist in the system
    const existingUsers = await this.syncRepository.getUsersByStudentIds(studentIds)

    // We’ll update in chunks of 1,000
    const BATCH_SIZE = 1000

    // Within each 1,000-chunk, we’ll limit concurrency to 20
    const CONCURRENCY_LIMIT = 10

    const curYear = new Date().getFullYear()
    const currentSemesterYear = (await this.syncRepository.getDefaultSemester())?.year ?? curYear
    const updateYearThreshold = currentSemesterYear - 20
    const departments = await this.syncRepository.getDepartments()
    const departmentMap = normalizeArray<EDepartment.Basic>(departments, (d) => d.id)

    const toUpdate = existingUsers
      .filter((user) => {
        const degreeInfo = studentDegreeMap[user.student_id]
        if (!degreeInfo) return false
        return !DegreeInfo.equals(degreeInfo, user)
      })
      .filter((user) => Number(user.student_id.slice(0, 4)) >= updateYearThreshold)
      .filter((user) => {
        const degree = studentDegreeMap[user.student_id]
        if (!degree) return false
        return departmentMap[degree.dept_id] !== undefined
      })
      .map((user) => {
        const degreeInfo = studentDegreeMap[user.student_id]!
        return {
          userId: user.id,
          departmentId: degreeInfo.dept_id,
        }
      })

    for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
      // Take a batch of up to 1,000 users
      const chunk = toUpdate.slice(i, i + this.BATCH_SIZE)
      for (let j = 0; j < chunk.length; j += CONCURRENCY_LIMIT) {
        const concurrencyChunk = chunk.slice(j, j + CONCURRENCY_LIMIT)

        await Promise.all(
          concurrencyChunk.map(async (item) => {
            try {
              await this.syncRepository.updateUserDepartment(item.userId, item.departmentId)
              degreeSyncResultDetail.updated.push(item)
            }
            catch (_e) {
              degreeSyncResultDetail.errors.push(item)
            }
          }),
        )
      }
    }
    await this.slackNoti.sendSyncNoti(
      `Degree updated: ${degreeSyncResultDetail.updated.length} / ${toUpdate.length}, errors: ${degreeSyncResultDetail.errors.length}`,
    )
    const endTime = new Date()
    await this.syncRepository.logSyncEndPoint(startLog.id, endTime, summarizeSyncResult(degreeSyncResultDetail))
    result.results.push(degreeSyncResultDetail)
    return result
  }

  async syncOtherMajor(data: IScholar.ScholarOtherMajorType[]) {
    await this.slackNoti.sendSyncNoti(`syncOtherMajor: ${data.length} other majors`)
    const startLog = await this.syncRepository.logSyncStartPoint(SyncType.MAJORS, 0, 0)
    const result: SyncResultDetails = {
      time: new Date(),
      year: 0,
      semester: 0,
      results: [],
    }
    const majorSyncResultDetail = new SyncResultDetail(SyncType.MAJORS)

    const departments = await this.syncRepository.getDepartments()
    const departmentMap = normalizeArray<EDepartment.Basic>(departments, (d) => d.name) as Record<
      string,
      EDepartment.Basic
    >

    // 1. Collect all student numbers and map them to their degree info
    const studentIds = Array.from(new Set(data.map((d) => `${d.STUDENT_ID}`)))
    const majorData = groupBy<MajorInfo<typeof APPLICATION_TYPE.MAJOR>, string>(
      data
        .filter((d) => d.APPLICATION_TYPE === '복수전공신청')
        .filter((d) => departmentMap[d.ID]?.id)
        .map(
          (d) => MajorInfo.deriveMajorInfo<typeof APPLICATION_TYPE.MAJOR>(d, APPLICATION_TYPE.MAJOR, departmentMap)!,
        ),
      (d) => `${d.student_id}`,
    )
    const minorData = groupBy<MajorInfo<typeof APPLICATION_TYPE.MINOR>, string>(
      data
        .filter((d) => d.APPLICATION_TYPE === '부전공신청')
        .filter((d) => departmentMap[d.ID]?.id)

        .map(
          (d) => MajorInfo.deriveMajorInfo<typeof APPLICATION_TYPE.MINOR>(d, APPLICATION_TYPE.MINOR, departmentMap)!,
        ),
      (d) => `${d.student_id}`,
    )

    // get users with majors
    const existingUsersWithMajors: EUser.WithMajors[] = await this.syncRepository.getUsersWithMajorsByStudentIds(studentIds)
    const existingUsersWithMajorsMap = normalizeArray(existingUsersWithMajors, (user) => user.id)
    const existingUsersWithMinors: EUser.WithMinors[] = await this.syncRepository.getUsersWithMinorsByStudentIds(studentIds)
    const existingUsersWithMinorsMap = normalizeArray(existingUsersWithMinors, (user) => user.id)

    const curYear = new Date().getFullYear()
    const currentSemesterYear = (await this.syncRepository.getDefaultSemester())?.year ?? curYear
    const updateYearThreshold = currentSemesterYear - 15

    const toUpdate = {
      major: existingUsersWithMajors
        .filter((user) => {
          if (Number(user.student_id.slice(0, 4)) < updateYearThreshold) return false
          const majorInfo = majorData[user.student_id]
          if (!majorInfo) return false
          return !MajorInfo.equals(majorInfo, user)
        })
        .map((user) => {
          const majorInfo = majorData[user.student_id]
          return {
            userId: user.id,
            majorInfoList: majorInfo,
          }
        }),
      minor: existingUsersWithMinors
        .filter((user) => {
          if (Number(user.student_id.slice(0, 4)) < updateYearThreshold) return false
          const minorInfo = minorData[user.student_id]
          if (!minorInfo) return false
          return !MajorInfo.equals(minorInfo, user)
        })
        .map((user) => {
          const minorInfo = minorData[user.student_id]
          return {
            userId: user.id,
            minorInfoList: minorInfo,
          }
        }),
    }

    const majorUpdate = {
      add: [] as { userId: number, departmentId: number }[],
      remove: [] as { userId: number, departmentId: number }[],
    }
    toUpdate.major.forEach((userMajorInfo) => {
      const { userId } = userMajorInfo
      const existingMajorInfo = existingUsersWithMajorsMap[userId]?.session_userprofile_majors
      const { majorInfoList } = userMajorInfo

      // 기존 정보와 새로운 정보를 `department_id` 기준으로 비교
      const existingSet = new Set(existingMajorInfo?.map((m) => m.department_id))
      const newSet = new Set(majorInfoList?.map((m) => m.department_id))

      // 추가해야 할 전공: 새로운 리스트에는 있지만 기존 리스트에는 없는 항목
      const toAdd = majorInfoList
        ?.filter((m) => !existingSet.has(m.department_id))
        .map((m) => ({ userId, departmentId: m.department_id }))

      // 제거해야 할 전공: 기존 리스트에는 있지만 새로운 리스트에는 없는 항목
      const toRemove = existingMajorInfo
        ?.filter((m) => !newSet.has(m.department_id))
        .map((m) => ({ userId, departmentId: m.department_id }))

      // console.log('userId', userId, 'toAdd', toAdd, 'toRemove', toRemove);
      if (toAdd && toAdd.length > 0) {
        majorUpdate.add = majorUpdate.add.concat(toAdd)
      }
      if (toRemove && toRemove.length > 0) {
        majorUpdate.remove = majorUpdate.remove.concat(toRemove)
      }
    })
    const minorUpdate = {
      add: [] as { userId: number, departmentId: number }[],
      remove: [] as { userId: number, departmentId: number }[],
    }
    toUpdate.minor.forEach((userMinorInfo) => {
      const { userId } = userMinorInfo
      const existingMinorInfo = existingUsersWithMinorsMap[userId]?.session_userprofile_minors
      const { minorInfoList } = userMinorInfo
      // console.log('existingMinorInfo', existingMinorInfo, 'minorInfoList', minorInfoList);

      // 기존 정보와 새로운 정보를 `department_id` 기준으로 비교
      const existingSet = new Set(existingMinorInfo?.map((m) => m.department_id))
      const newSet = new Set(minorInfoList?.map((m) => m.department_id))

      // 추가해야 할 전공: 새로운 리스트에는 있지만 기존 리스트에는 없는 항목
      const toAdd = minorInfoList
        ?.filter((m) => !existingSet.has(m.department_id))
        .map((m) => ({ userId, departmentId: m.department_id }))

      // 제거해야 할 전공: 기존 리스트에는 있지만 새로운 리스트에는 없는 항목
      const toRemove = existingMinorInfo
        ?.filter((m) => !newSet.has(m.department_id))
        .map((m) => ({ userId, departmentId: m.department_id }))
      // console.log('userId', userId, 'toAdd', toAdd, 'toRemove', toRemove);
      if (toAdd && toAdd.length > 0) {
        minorUpdate.add = minorUpdate.add.concat(toAdd)
      }
      if (toRemove && toRemove.length > 0) {
        minorUpdate.remove = minorUpdate.remove.concat(toRemove)
      }
    })

    for (const update of [majorUpdate, minorUpdate]) {
      for (let i = 0; i < update.add.length; i += this.BATCH_SIZE) {
        // Take a batch of up to 1,000 users
        const chunk = update.add.slice(i, i + this.BATCH_SIZE)
        // Now break `toUpdate` into sub-chunks of size 20 (limited concurrency)

        // Parallel update each sub-chunk
        try {
          // Your single-row update method
          if (update === majorUpdate) {
            await this.syncRepository.createManyUserMajor(chunk)
          }
          else {
            await this.syncRepository.createManyUserMinor(chunk)
          }
          majorSyncResultDetail.updated = majorSyncResultDetail.updated.concat(chunk)
          majorSyncResultDetail.created = majorSyncResultDetail.created.concat(chunk)
        }
        catch (_e) {
          majorSyncResultDetail.errors = majorSyncResultDetail.errors.concat(chunk)
        }
      }

      for (let i = 0; i < update.remove.length; i += this.BATCH_SIZE) {
        // Take a batch of up to 1,000 users
        const chunk = update.remove.slice(i, i + this.BATCH_SIZE)
        // Now break `toUpdate` into sub-chunks of size 20 (limited concurrency)
        for (let j = 0; j < chunk.length; j += this.CONCURRENCY_LIMIT) {
          const concurrencyChunk = chunk.slice(j, j + this.CONCURRENCY_LIMIT)

          concurrencyChunk.map(async (item) => {
            try {
              // Your single-row update method
              if (update === majorUpdate) {
                await this.syncRepository.deleteUserMajor(item.userId, item.departmentId)
              }
              else {
                await this.syncRepository.deleteUserMinor(item.userId, item.departmentId)
              }
              majorSyncResultDetail.updated.push(item)
            }
            catch (_e) {
              majorSyncResultDetail.errors.push(item)
            }
          })
        }
      }
    }
    await this.slackNoti.sendSyncNoti(
      `otherMajor updated: ${majorSyncResultDetail.updated.length} / ${toUpdate.major.length + toUpdate.minor.length}, errors: ${majorSyncResultDetail.errors.length}`,
    )
    const endTime = new Date()
    await this.syncRepository.logSyncEndPoint(startLog.id, endTime, summarizeSyncResult(majorSyncResultDetail))
    result.results.push(majorSyncResultDetail)
    return result
  }
}
