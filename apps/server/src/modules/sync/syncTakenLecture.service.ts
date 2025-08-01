import { Inject, Injectable } from '@nestjs/common'
import { REDIS_CLIENT } from '@otl/redis/redis.provider'
import { TakenLectureMQ } from '@otl/server-nest/modules/sync/domain/sync.mq'
import * as Sentry from '@sentry/node'
import { StatusCodes } from 'http-status-codes'
import Redis from 'ioredis'
import { uuid } from 'uuidv4'

import { SyncProgress } from '@otl/common'
import { SyncStatus } from '@otl/common/enum/sync'
import { SyncException } from '@otl/common/exception/sync.exception'

import { SyncRepository } from '@otl/prisma-client/repositories'

@Injectable()
export class SyncTakenLectureService {
  constructor(
    private readonly syncRepository: SyncRepository,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @Inject(TakenLectureMQ) private readonly takenLectureMQ: TakenLectureMQ,
  ) {}

  async repopulateTakenLectureForStudent(userId: number) {
    const user = await this.syncRepository.getUserWithId(userId)
    if (!user) throw new Error('User not found')
    const studentId = parseInt(user.student_id)
    if (Number.isNaN(studentId)) return
    const rawTakenLectures = await this.syncRepository.getRawTakenLecturesOfStudent(studentId)
    await this.syncRepository.repopulateTakenLecturesOfUser(user.id, rawTakenLectures)
  }

  async createRequest(year: number, semester: number, userId: number, studentId: number) {
    const jobIdentifier = `${userId}:${year}:${semester}`
    const statusKey = `taken-lecture-sync:status:${jobIdentifier}`

    const existingRequestId = await this.redis.get(statusKey)
    if (existingRequestId) {
      const progressKey = `taken-lecture-sync:progress:${existingRequestId}`
      const progressData = await this.redis.hgetall(progressKey)
      const progress = this.parseProgress(progressData)!
      if (progressData) {
        const error = new SyncException(
          StatusCodes.BAD_REQUEST,
          SyncException.DUPLICATE_TAKEN_LECTURE_SYNC_REQUEST,
          'createRequest',
        )
        Sentry.captureException(error)
        return { requestId: existingRequestId, progress }
      }
    }

    const requestId = uuid()
    const progressKey = `taken-lecture-sync:progress:${requestId}`
    const initialProgress = {
      status: SyncStatus.NotStarted,
      completed: 0,
      total: 0,
      startedAt: new Date().toISOString(),
    }
    const oneHourInSeconds = 3600

    await this.redis
      .multi()
      .set(statusKey, requestId, 'EX', oneHourInSeconds)
      .hmset(progressKey, initialProgress)
      .expire(progressKey, oneHourInSeconds)
      .exec()

    await this.takenLectureMQ.publishTakenLectureSyncRequest(requestId, userId, studentId, year, semester)
    return { requestId, ...initialProgress, startedAt: new Date(initialProgress.startedAt) }
  }

  async getActiveSyncRequest(requestId: string) {
    const progressKey = `taken-lecture-sync:progress:${requestId}`

    const progressData = await this.redis.hgetall(progressKey)
    if (!progressData || Object.keys(progressData).length === 0) {
      return null
    }
    const progress: SyncProgress = {
      status: progressData.status as SyncStatus,
      total: parseInt(progressData.total),
      completed: parseInt(progressData.completed),
      startedAt: new Date(progressData.startedAt),
    }
    return { requestId, ...progress }
  }

  async getSyncRequests(year: number, semester: number, userId: number) {
    const statusKey = `taken-lecture-sync:status:${userId}:${year}:${semester}`
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
