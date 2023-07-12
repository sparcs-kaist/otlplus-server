import { Module } from '@nestjs/common';
import { CourseController } from './courses.controller';
import { CoursesService } from './courses.service';

@Module({
  controllers: [CourseController],
  providers: [CoursesService]
})
export class CoursesModule {}
