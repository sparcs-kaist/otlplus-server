import { Module } from '@nestjs/common';
import { SyncService } from '@otl/scholar-sync/modules/sync/sync.service';
import { SyncSchedule } from '@otl/scholar-sync/modules/sync/sync.schedule';
import { ScholarModule } from '@otl/scholar-sync/clients/scholar/scholar.module';
import { SlackModule } from '@otl/scholar-sync/clients/slack/slack.module';
import { SyncDynamicController } from '@otl/scholar-sync/modules/sync/sync.dynamic.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '@otl/prisma-client/prisma.module';

@Module({
  imports: [PrismaModule, SlackModule, ScholarModule, ScheduleModule],
  controllers: [SyncDynamicController],
  providers: [SyncService, SyncSchedule],
  exports: [SyncService, SyncSchedule],
})
export class SyncModule {}
