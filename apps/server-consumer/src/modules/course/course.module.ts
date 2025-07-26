import { Module } from '@nestjs/common'
import { RmqConnectionModule } from '@otl/rmq'
import { CourseService } from '@otl/server-consumer/modules/course/course.service'
import { LectureModule } from '@otl/server-consumer/modules/lecture/lecture.module'
import { COURSE_REPOSITORY } from '@otl/server-consumer/out/course.repository'
import { LECTURE_REPOSITORY } from '@otl/server-consumer/out/lecture.repository'
import { REVIEW_REPOSITORY } from '@otl/server-consumer/out/review.repository'

import {
  CourseRepository, LectureRepository, PrismaModule, ReviewsRepository,
} from '@otl/prisma-client'

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
    {
      provide: LECTURE_REPOSITORY,
      useClass: LectureRepository,
    },
    CourseService,
  ],
  controllers: [],
  exports: [CourseService],
})
export class CourseModule {}
