import { Module } from '@nestjs/common'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { LecturesModule } from '../lectures/lectures.module'
import { SemestersModule } from '../semesters/semesters.module'
import { TimetablesModule } from '../timetables/timetables.module'
import { ShareController } from './share.controller'
import { ShareService } from './share.service'

@Module({
  imports: [PrismaModule, TimetablesModule, SemestersModule, LecturesModule],
  controllers: [ShareController],
  providers: [ShareService],
})
export class ShareModule {}
