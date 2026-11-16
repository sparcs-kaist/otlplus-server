import { Module } from '@nestjs/common'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { SemestersModuleV2 } from '../semesters/v2/semesters.module'
import { CourseController } from './courses.controller'
import { CoursesService } from './courses.service'
import { CourseControllerV2 } from './v2/course.controller'
import { CoursesServiceV2 } from './v2/courses.service'

@Module({
  imports: [PrismaModule, SemestersModuleV2],
  controllers: [CourseController, CourseControllerV2],
  providers: [CoursesService, CoursesServiceV2],
})
export class CoursesModule {}
