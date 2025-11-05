import { Module } from '@nestjs/common'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { CourseController } from './courses.controller'
import { CoursesService } from './courses.service'
import { CourseV2Controller } from './v2/course.v2.controller'
import { CoursesServiceV2 } from './v2/courses.v2.service'

@Module({
  imports: [PrismaModule],
  controllers: [CourseController, CourseV2Controller],
  providers: [CoursesService, CoursesServiceV2],
})
export class CoursesModule {}
