import { Inject, Injectable } from '@nestjs/common'
import { REDIS_CLIENT } from '@otl/redis/redis.provider'
import { ISync } from '@otl/server-nest/common/interfaces/ISync'
import { TakenLectureMQ } from '@otl/server-nest/modules/sync/domain/sync.mq'
import * as Sentry from '@sentry/node'
import { StatusCodes } from 'http-status-codes'
import Redis from 'ioredis'

import { SyncProgress } from '@otl/common'
import { SyncStatus } from '@otl/common/enum/sync'
import { SyncException } from '@otl/common/exception/sync.exception'

import { ELecture, ETakenLecture } from '@otl/prisma-client/entities'
import { SyncRepository } from '@otl/prisma-client/repositories'

import { SlackNotiService } from './slackNoti.service'

@Injectable()
export class SyncTakenLectureService {
  constructor(
    private readonly syncRepository: SyncRepository,
    private readonly slackNoti: SlackNotiService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @Inject(TakenLectureMQ) private readonly takenLectureMQ: TakenLectureMQ,
  ) {}

  async syncTakenLecture(data: ISync.TakenLectureBody) {
    this.slackNoti.sendSyncNoti(`syncTakenLecture: ${data.year}-${data.semester}: ${data.attend.length} attend records`)

    const result: any = {
      time: new Date().toISOString(),
      updated: [],
      errors: [],
    }

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
    this.slackNoti.sendSyncNoti(
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

    studentIds.forEach((studentId) => {
      studentPairMap.set(studentId, [[], [], []])
    })

    existingUserTakenLectures.forEach((user) => {
      const student_id = parseInt(user.student_id)
      const pair = studentPairMap.get(student_id)!
      pair[0].push(...user.taken_lectures)
    })

    data.attend.forEach((attend) => {
      const lectureId = this.getLectureIdOfAttendRecord(existingLectures, attend)
      if (lectureId) {
        const pair = studentPairMap.get(attend.STUDENT_NO)!
        pair[1].push(lectureId)
      }
      else {
        result.errors.push({
          student_no: attend.STUDENT_NO,
          attend,
          error: 'lecture not found',
        })
      }
    })

    const userprofiles = await this.syncRepository.getUserProfileIdsFromStudentIds(studentIds)
    userprofiles.forEach((user) => {
      const student_id = parseInt(user.student_id)
      const pair = studentPairMap.get(student_id)!
      pair[2].push(user.id)
    })

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
            result.updated.push({
              studentId,
              remove: recordIdsToRemove.map((id) => existingTakenLectures.find((e) => e.id === id)?.lecture_id),
              add: recordsToAdd,
            })
          }
        }
      }
      catch (e: unknown) {
        result.errors.push({ studentId, error: e instanceof Error ? e.message : 'Unknown error' })
      }
    }

    await this.syncRepository.replaceRawTakenLectures(saveToDB, {
      year: data.year,
      semester: data.semester,
    })

    this.slackNoti.sendSyncNoti(
      `syncTakenLecture: ${result.updated.length} updated, ${skipCount} skipped, ${result.errors.length} errors`,
    )

    return result
  }

  getLectureIdOfAttendRecord(lectures: ELecture.Basic[], attend: ISync.AttendType) {
    const lecture = lectures.find((l) => l.new_code === attend.SUBJECT_NO && l.class_no === attend.LECTURE_CLASS.trim())
    return lecture?.id
  }

  async repopulateTakenLectureForStudent(userId: number) {
    const user = await this.syncRepository.getUserWithId(userId)
    if (!user) throw new Error('User not found')
    const studentId = parseInt(user.student_id)
    if (Number.isNaN(studentId)) return // Skip if student_id is not a number
    const rawTakenLectures = await this.syncRepository.getRawTakenLecturesOfStudent(studentId)
    await this.syncRepository.repopulateTakenLecturesOfUser(user.id, rawTakenLectures)
  }

  async createRequest(year: number, semester: number, studentId: number) {
    const jobIdentifier = `${studentId}:${year}:${semester}`
    const statusKey = `taken-lecture-sync:status:${jobIdentifier}`

    const existingRequestId = await this.redis.get(statusKey)
    if (existingRequestId) {
      const progressKey = `taken-lecture-sync:progress:${existingRequestId}`
      const progressData = await this.redis.get(progressKey)
      if (progressData) {
        const error = new SyncException(
          StatusCodes.BAD_REQUEST,
          SyncException.DUPLICATE_TAKEN_LECTURE_SYNC_REQUEST,
          'createRequest',
        )
        Sentry.captureException(error)
        return { requestId: existingRequestId, ...JSON.parse(progressData) }
      }
    }

    const requestId = crypto.randomUUID()
    const progressKey = `taken-lecture-sync:progress:${requestId}`
    const initialProgress: SyncProgress = {
      status: SyncStatus.NotStarted,
      completed: 0,
      total: 0,
      startedAt: new Date(),
    }
    const oneHourInSeconds = 3600

    // 원자성을 보장하기 위해 Redis 트랜잭션(MULTI) 사용
    await this.redis
      .multi()
      .set(statusKey, requestId, 'EX', oneHourInSeconds) // 1시간 후 만료
      .set(progressKey, JSON.stringify(initialProgress), 'EX', oneHourInSeconds)
      .exec()

    await this.takenLectureMQ.publishTakenLectureSyncRequest(requestId, studentId, year, semester)
    return { requestId, ...initialProgress }
  }

  async getActiveSyncRequest(requestId: string) {
    const progressKey = `taken-lecture-sync:progress:${requestId}`
    const progressData = await this.redis.get(progressKey)

    if (!progressData) {
      return null
    }
    const progress: SyncProgress = JSON.parse(progressData)
    return { requestId, ...progress }
  }

  async getSyncRequests(year: number, semester: number, studentId: number) {
    const statusKey = `taken-lecture-sync:status:${studentId}:${year}:${semester}`
    const requestId = await this.redis.get(statusKey)

    if (!requestId) {
      return null
    }

    const progress = await this.getActiveSyncRequest(requestId)

    if (progress && (progress.status === 'PENDING' || progress.status === 'IN_PROGRESS')) {
      return requestId
    }

    return null
  }
}
