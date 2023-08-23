import { Module } from '@nestjs/common';
import { TimetablesController } from './timetables.controller';
import { TimetablesService } from './timetables.service';
import { PrismaModule } from "../../prisma/prisma.module";
import { LecturesModule } from "../lectures/lectures.module";

@Module({
  imports: [PrismaModule, LecturesModule],
  controllers: [TimetablesController],
  providers: [TimetablesService]
})
export class TimetablesModule {}
