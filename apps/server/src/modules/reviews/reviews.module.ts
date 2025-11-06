import { Module } from '@nestjs/common'
import { RmqConnectionModule, RmqModule } from '@otl/rmq'
import { StatisticsUpdatePublisher } from '@otl/rmq/exchanges/statistics/statistics.publish.v2'
import { REVIEW_MQ } from '@otl/server-nest/modules/reviews/domain/out/ReviewMQ'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { UserService } from '../user/user.service'
import { ReviewsController } from './reviews.controller'
import { ReviewsService } from './reviews.service'
import { ReviewsControllerV2 } from './v2/reviews.controller'
import { ReviewsServiceV2 } from './v2/reviews.service'

@Module({
  imports: [PrismaModule, RmqModule, RmqConnectionModule.register()],
  controllers: [ReviewsController, ReviewsControllerV2],
  providers: [
    {
      provide: REVIEW_MQ,
      useClass: StatisticsUpdatePublisher,
    },
    ReviewsService,
    ReviewsServiceV2,
    UserService,
  ],
})
export class ReviewsModule {}
