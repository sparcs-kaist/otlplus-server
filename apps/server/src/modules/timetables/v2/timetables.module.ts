import { Module } from '@nestjs/common'
import { RmqConnectionModule, RmqModule } from '@otl/rmq'
import { StatisticsUpdatePublisher } from '@otl/rmq/exchanges/statistics/statistics.publish.v2'
// TODO: change lecture module for v2
import { LecturesModule } from '@otl/server-nest/modules/lectures/lectures.module'
import { TIMETABLE_MQ } from '@otl/server-nest/modules/timetables/domain/out/TimetableMQ'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { TimetablesControllerV2 } from './timetables.controller'
import { TimetablesServiceV2 } from './timetables.service'

@Module({
  imports: [PrismaModule, LecturesModule, RmqModule, RmqConnectionModule.register()],
  controllers: [TimetablesControllerV2],
  providers: [
    {
      provide: TIMETABLE_MQ,
      useClass: StatisticsUpdatePublisher,
    },
    TimetablesServiceV2,
  ],
  exports: [TimetablesServiceV2],
})
export class TimetablesModule {}
