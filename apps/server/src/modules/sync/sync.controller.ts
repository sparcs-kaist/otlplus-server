import {
  Body, Controller, Get, Inject, MessageEvent, Param, Post, Query, Sse,
} from '@nestjs/common'
import { REDIS_SUBSCRIBER_CLIENT } from '@otl/redis/redis.provider'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { ISync } from '@otl/server-nest/common/interfaces/ISync'
import { session_userprofile } from '@prisma/client'
import { StatusCodes } from 'http-status-codes'
import Redis from 'ioredis'
import { finalize, Observable, Subject } from 'rxjs'

import { getCurrentMethodName } from '@otl/common'
import { UserException } from '@otl/common/exception/user.exception'

import { SyncTakenLectureService } from './syncTakenLecture.service'

@Controller('api/sync')
export class SyncController {
  constructor(
    private readonly syncTakenLectureService: SyncTakenLectureService,
    @Inject(REDIS_SUBSCRIBER_CLIENT) private readonly redisSubscriber: Redis,
  ) {}

  @Post('requests')
  async postNewSyncRequest(@Body() body: ISync.TakenLectureSyncBody, @GetUser() user: session_userprofile) {
    const studentId = user.student_id
    if (!studentId) {
      throw new UserException(StatusCodes.BAD_REQUEST, UserException.NO_STUDENT_ID, getCurrentMethodName())
    }
    return await this.syncTakenLectureService.createRequest(body.year, body.semester, user.id, parseInt(studentId))
  }

  @Get('requests/active/:requestId')
  async getActiveSyncRequest(@GetUser() user: session_userprofile, @Param('requestId') requestId: string) {
    const studentId = user.student_id
    if (!studentId) {
      throw new UserException(StatusCodes.BAD_REQUEST, UserException.NO_STUDENT_ID, getCurrentMethodName())
    }
    return await this.syncTakenLectureService.getActiveSyncRequest(requestId)
  }

  @Get('requests/active')
  async getSyncRequests(@GetUser() user: session_userprofile, @Query() query: ISync.TakenLectureSyncQuery) {
    const studentId = user.student_id
    if (!studentId) {
      throw new UserException(StatusCodes.BAD_REQUEST, UserException.NO_STUDENT_ID, getCurrentMethodName())
    }
    return await this.syncTakenLectureService.getSyncRequests(query.year, query.semester, user.id)
  }

  @Sse('sync/requests/:requestId/stream')
  streamSyncProgress(@Param('requestId') requestId: string): Observable<MessageEvent> {
    const channel = `sync-progress:${requestId}`

    // Subject는 Observable과 Observer의 역할을 모두 하는 특수한 객체입니다.
    // Redis 메시지를 받아서 SSE 스트림으로 보내는 다리 역할을 합니다.
    const subject = new Subject<MessageEvent>()

    const messageHandler = (ch: string, message: string) => {
      // 내가 구독한 채널에서 온 메시지가 맞는지 확인
      if (ch === channel) {
        const progress = JSON.parse(message)

        // NestJS SSE 형식에 맞게 데이터를 객체로 감싸서 보냅니다.
        subject.next({ data: progress })

        // 작업 완료 또는 실패 시 스트림을 종료합니다.
        if (progress.status === 'COMPLETED' || progress.status === 'FAILED') {
          subject.complete()
        }
      }
    }

    this.redisSubscriber.on('message', messageHandler)
    this.redisSubscriber.subscribe(channel)

    // 클라이언트 연결이 끊어지면 finalize가 호출되어 뒷정리를 합니다.
    return subject.asObservable().pipe(
      finalize(() => {
        // Redis 구독을 해지하고 리스너를 제거하여 메모리 누수를 방지합니다.
        this.redisSubscriber.unsubscribe(channel)
        this.redisSubscriber.removeListener('message', messageHandler)
        console.log(`SSE stream closed for requestId: ${requestId}`)
      }),
    )
  }
}
