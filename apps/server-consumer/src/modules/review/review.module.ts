import { Module } from '@nestjs/common'
import { RmqConnectionModule } from '@otl/rmq'
import { ReviewService } from '@otl/server-consumer/modules/review/review.service'
import { REVIEW_REPOSITORY } from '@otl/server-consumer/out/review.repository'

import { PrismaModule, ReviewsRepository } from '@otl/prisma-client'

@Module({
  imports: [PrismaModule, RmqConnectionModule.register()],
  providers: [
    {
      provide: REVIEW_REPOSITORY,
      useClass: ReviewsRepository,
    },
    ReviewService,
  ],
  controllers: [],
  exports: [ReviewService],
})
export class ReviewModule {}
