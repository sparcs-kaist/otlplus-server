import { Module } from '@nestjs/common'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { CourseController } from './courses.controller'
import { CoursesService } from './courses.service'

@Module({
  imports: [PrismaModule],
  controllers: [CourseController],
  providers: [CoursesService],
})
export class CoursesModule {}
