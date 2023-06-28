import { Module } from '@nestjs/common';
import { TimetablesController } from './timetables.controller';
import { TimetablesService } from './timetables.service';

@Module({
  controllers: [TimetablesController],
  providers: [TimetablesService]
})
export class TimetablesModule {}
