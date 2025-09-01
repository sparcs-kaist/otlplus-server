import { Module } from '@nestjs/common'
import { RedlockModule } from '@otl/redis'
import { RmqConnectionModule } from '@otl/rmq'
import { LectureService } from '@otl/server-consumer/modules/lecture/lecture.service'
import { LECTURE_REPOSITORY } from '@otl/server-consumer/out/lecture.repository'
import { PROFESSOR_REPOSITORY } from '@otl/server-consumer/out/professor.repository'
import { REVIEW_REPOSITORY } from '@otl/server-consumer/out/review.repository'

import { LectureRepository, PrismaModule, ReviewsRepository } from '@otl/prisma-client'
import { ProfessorRepository } from '@otl/prisma-client/repositories/professor.repository'

@Module({
  imports: [
    PrismaModule,
    RmqConnectionModule.register(),
    RedlockModule.register({
      retryCount: 0,
      retryDelay: 1000,
    }),
  ],
  providers: [
    {
      provide: LECTURE_REPOSITORY,
      useClass: LectureRepository,
    },
    {
      provide: PROFESSOR_REPOSITORY,
      useClass: ProfessorRepository,
    },
    {
      provide: REVIEW_REPOSITORY,
      useClass: ReviewsRepository,
    },
    LectureService,
  ],
  controllers: [],
  exports: [LectureService],
})
export class LectureModule {}
