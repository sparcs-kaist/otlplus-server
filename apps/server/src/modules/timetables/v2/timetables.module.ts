import { Module } from '@nestjs/common'
import { RmqConnectionModule, RmqModule } from '@otl/rmq'
import { StatisticsUpdatePublisher } from '@otl/rmq/exchanges/statistics/statistics.publish.v2'
import { TIMETABLE_MQ } from '@otl/server-nest/modules/timetables/domain/out/TimetableMQ'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { TimetablesControllerV2 } from './timetables.controller'
import { TimetablesServiceV2 } from './timetables.service'

@Module({
  imports: [PrismaModule, RmqModule, RmqConnectionModule.register()],
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
export class TimetablesModuleV2 {}
