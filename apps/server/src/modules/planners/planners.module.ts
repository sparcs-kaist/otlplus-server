import { Module } from '@nestjs/common'
import { CoursesService } from '@otl/server-nest/modules/courses/courses.service'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { PlannersController } from './planners.controller'
import { PlannersService } from './planners.service'

@Module({
  imports: [PrismaModule],
  controllers: [PlannersController],
  providers: [PlannersService, CoursesService],
})
export class PlannersModule {}
