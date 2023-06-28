import { Module } from '@nestjs/common';
import { LecturesController } from './lectures.controller';
import { LecturesService } from './lectures.service';

@Module({
  controllers: [LecturesController],
  providers: [LecturesService]
})
export class LecturesModule {}
