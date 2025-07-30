import { Module } from '@nestjs/common'
import { RedisModule, RedlockModule } from '@otl/redis'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { SlackNotiService } from './slackNoti.service'
import { SyncController } from './sync.controller'
import { SyncScholarDBService } from './syncScholarDB.service'
import { SyncTakenLectureService } from './syncTakenLecture.service'

@Module({
  controllers: [SyncController],
  providers: [SyncScholarDBService, SyncTakenLectureService, SlackNotiService],
  imports: [
    PrismaModule,
    RedisModule,
    RedlockModule.register({
      retryCount: 3,
      retryDelay: 200,
    }),
  ],
  exports: [SyncTakenLectureService],
})
export class SyncModule {}
