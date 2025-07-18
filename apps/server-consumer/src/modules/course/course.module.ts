import { Module } from '@nestjs/common'
import { RmqConnectionModule } from '@otl/rmq'
import { CourseService } from '@otl/server-consumer/modules/course/course.service'
import { LectureModule } from '@otl/server-consumer/modules/lecture/lecture.module'
import { COURSE_REPOSITORY } from '@otl/server-consumer/out/course.repository'
import { REVIEW_REPOSITORY } from '@otl/server-consumer/out/review.repository'

import { CourseRepository, PrismaModule, ReviewsRepository } from '@otl/prisma-client'

@Module({
  imports: [PrismaModule, RmqConnectionModule.register(), LectureModule],
  providers: [
    {
      provide: COURSE_REPOSITORY,
      useClass: CourseRepository,
    },
    {
      provide: REVIEW_REPOSITORY,
      useClass: ReviewsRepository,
    },
    CourseService,
  ],
  controllers: [],
  exports: [CourseService],
})
export class CourseModule {}
