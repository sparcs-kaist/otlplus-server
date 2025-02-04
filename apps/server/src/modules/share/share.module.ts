import { Module } from '@nestjs/common';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';
import { TimetablesModule } from '../timetables/timetables.module';
import { PrismaModule } from '@src/prisma/prisma.module';
import { SemestersModule } from '../semesters/semesters.module';
import { LecturesModule } from '../lectures/lectures.module';

@Module({
  imports: [PrismaModule, TimetablesModule, SemestersModule, LecturesModule],
  controllers: [ShareController],
  providers: [ShareService],
})
export class ShareModule {}
