import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { LecturesModule } from '../lectures/lectures.module';
import { TimetablesController } from './timetables.controller';
import { TimetablesService } from './timetables.service';

@Module({
  imports: [PrismaModule, LecturesModule],
  controllers: [TimetablesController],
  providers: [TimetablesService],
})
export class TimetablesModule {}
