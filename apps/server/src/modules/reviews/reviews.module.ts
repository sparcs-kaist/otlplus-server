import { Module } from '@nestjs/common'
import { RmqConnectionModule, RmqModule } from '@otl/rmq'
import { StatisticsUpdatePublisher } from '@otl/rmq/exchanges/statistics/statistics.publish.v2'
import { REVIEW_MQ } from '@otl/server-nest/modules/reviews/domain/out/ReviewMQ'

import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { UserService } from '../user/user.service'
import { ReviewsController } from './reviews.controller'
import { ReviewsService } from './reviews.service'
import { ReviewsV2Controller } from './v2/reviews.v2.controller'
import { ReviewsV2Service } from './v2/reviews.v2.service'

@Module({
  imports: [PrismaModule, RmqModule, RmqConnectionModule.register()],
  controllers: [ReviewsController, ReviewsV2Controller],
  providers: [
    {
      provide: REVIEW_MQ,
      useClass: StatisticsUpdatePublisher,
    },
    ReviewsService,
    ReviewsV2Service,
    UserService,
  ],
})
export class ReviewsModule {}
