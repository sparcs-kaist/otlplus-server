import { Module } from '@nestjs/common'
import { StatisticsUpdatePublisher } from '@otl/rmq/exchanges/statistics/statistics.publish'
import { TIMETABLE_MQ } from '@otl/server-nest/modules/timetables/domain/out/TimetableMQ'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { LecturesModule } from '../lectures/lectures.module'
import { TimetablesController } from './timetables.controller'
import { TimetablesService } from './timetables.service'

@Module({
  imports: [PrismaModule, LecturesModule],
  controllers: [TimetablesController],
  providers: [
    {
      provide: TIMETABLE_MQ,
      useClass: StatisticsUpdatePublisher,
    },
    TimetablesService,
  ],
  exports: [TimetablesService],
})
export class TimetablesModule {}
