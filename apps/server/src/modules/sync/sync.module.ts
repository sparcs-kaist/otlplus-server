import { Module } from '@nestjs/common'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { SlackNotiService } from './slackNoti.service'
import { SyncController } from './sync.controller'
import { SyncScholarDBService } from './syncScholarDB.service'
import { SyncTakenLectureService } from './syncTakenLecture.service'

@Module({
  controllers: [SyncController],
  providers: [SyncScholarDBService, SyncTakenLectureService, SlackNotiService],
  imports: [PrismaModule],
  exports: [SyncTakenLectureService],
})
export class SyncModule {}
