import { Module } from '@nestjs/common'
import { StatisticsUpdatePublisher } from '@otl/rmq/exchanges/statistics/statistics.publish'
import { REVIEW_MQ } from '@otl/server-nest/modules/reviews/domain/out/ReviewMQ'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { UserService } from '../user/user.service'
import { ReviewsController } from './reviews.controller'
import { ReviewsService } from './reviews.service'

@Module({
  imports: [PrismaModule],
  controllers: [ReviewsController],
  providers: [
    {
      provide: REVIEW_MQ,
      useClass: StatisticsUpdatePublisher,
    },
    ReviewsService,
    UserService,
  ],
})
export class ReviewsModule {}
