import { Module } from '@nestjs/common'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { CourseController } from './courses.controller'
import { CoursesService } from './courses.service'
import { CourseControllerV2 } from './v2/course.controller'
import { CoursesServiceV2 } from './v2/courses.service'

@Module({
  imports: [PrismaModule],
  controllers: [CourseController, CourseControllerV2],
  providers: [CoursesService, CoursesServiceV2],
})
export class CoursesModule {}
