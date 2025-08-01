import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { RmqConnectionModule, RmqModule } from '@otl/rmq'
import { ScholarUpdatePublisher } from '@otl/rmq/exchanges/scholar-sync/scholar.publish'
import { StatisticsUpdatePublisher } from '@otl/rmq/exchanges/statistics/statistics.publish.v2'
import { ScholarModule } from '@otl/scholar-sync/clients/scholar/scholar.module'
import { SlackModule } from '@otl/scholar-sync/clients/slack/slack.module'
import { SCHOLAR_MQ } from '@otl/scholar-sync/domain/out/ScholarMQ'
import { STATISTICS_MQ } from '@otl/scholar-sync/domain/out/StatisticsMQ'
import { SyncDynamicController } from '@otl/scholar-sync/modules/sync/sync.dynamic.controller'
import { SyncSchedule } from '@otl/scholar-sync/modules/sync/sync.schedule'
import { SyncService } from '@otl/scholar-sync/modules/sync/sync.service'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

@Module({
  imports: [PrismaModule, SlackModule, ScholarModule, ScheduleModule, RmqModule, RmqConnectionModule.register()],
  controllers: [SyncDynamicController],
  providers: [
    {
      provide: SCHOLAR_MQ,
      useClass: ScholarUpdatePublisher,
    },
    {
      provide: STATISTICS_MQ,
      useClass: StatisticsUpdatePublisher,
    },
    SyncService,
    SyncSchedule,
  ],
  exports: [SyncService, SyncSchedule],
})
export class SyncModule {}
