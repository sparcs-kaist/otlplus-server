import { Module } from '@nestjs/common'
import { ElasticsearchModule } from '@otl/elasticsearch-client'
import settings from '@otl/server-nest/settings'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { CourseController } from './courses.controller'
import { CoursesService } from './courses.service'
import { CourseControllerV2 } from './v2/course.controller'
import { CoursesServiceV2 } from './v2/courses.service'

@Module({
  imports: [PrismaModule, ElasticsearchModule.register(settings().getElasticsearchConfig())],
  controllers: [CourseController, CourseControllerV2],
  providers: [CoursesService, CoursesServiceV2],
})
export class CoursesModule {}
