import { Module } from '@nestjs/common';
import { SlackNotiService } from './slackNoti.service';
import { SyncController } from './sync.controller';
import { SyncScholarDBService } from './syncScholarDB.service';
import { SyncTakenLectureService } from './syncTakenLecture.service';
import { PrismaModule } from '@src/prisma/prisma.module';

@Module({
  controllers: [SyncController],
  providers: [SyncScholarDBService, SyncTakenLectureService, SlackNotiService],
  imports: [PrismaModule],
  exports: [SyncTakenLectureService],
})
export class SyncModule {}
