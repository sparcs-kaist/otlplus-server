import { Module } from '@nestjs/common'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { CourseV2Controller } from './course.v2.controller'
import { CourseController } from './courses.controller'
import { CoursesService } from './courses.service'

@Module({
  imports: [PrismaModule],
  controllers: [CourseController, CourseV2Controller],
  providers: [CoursesService],
})
export class CoursesModule {}
