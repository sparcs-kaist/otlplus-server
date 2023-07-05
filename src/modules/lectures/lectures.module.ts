import { Module } from '@nestjs/common';
import { LecturesController } from './lectures.controller';
import { LecturesService } from './lectures.service';
import { LectureRepository } from '../../prisma/repositories/lecture.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule], 
  controllers: [LecturesController], 
  providers: [LecturesService, LectureRepository]
})
export class LecturesModule {}
