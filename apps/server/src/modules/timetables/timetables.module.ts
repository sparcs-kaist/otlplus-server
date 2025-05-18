import { Module } from '@nestjs/common'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { LecturesModule } from '../lectures/lectures.module'
import { TimetablesController, v2TimetablesController } from './timetables.controller'
import { TimetablesService } from './timetables.service'

@Module({
  imports: [PrismaModule, LecturesModule],
  controllers: [TimetablesController, v2TimetablesController],
  providers: [TimetablesService],
  exports: [TimetablesService],
})
export class TimetablesModule {}
