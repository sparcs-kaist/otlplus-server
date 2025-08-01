import { Module } from '@nestjs/common'
import { RedisModule, RedlockModule } from '@otl/redis'
import { RmqModule } from '@otl/rmq'
import { ScholarUpdatePublisher } from '@otl/rmq/exchanges/scholar-sync/scholar.publish'
import { TakenLectureMQ } from '@otl/server-nest/modules/sync/domain/sync.mq'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { SlackNotiService } from './slackNoti.service'
import { SyncController } from './sync.controller'
import { SyncTakenLectureService } from './syncTakenLecture.service'

@Module({
  controllers: [SyncController],
  providers: [
    SyncTakenLectureService,
    SlackNotiService,
    {
      provide: TakenLectureMQ,
      useClass: ScholarUpdatePublisher,
    },
  ],
  imports: [
    PrismaModule,
    RedisModule,
    RedlockModule.register({
      retryCount: 3,
      retryDelay: 200,
    }),
    RmqModule,
  ],
  exports: [SyncTakenLectureService],
})
export class SyncModule {}
