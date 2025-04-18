import { Controller, Get, Query } from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { IFeed } from '@otl/server-nest/common/interfaces'
import { toJsonFeedDetails } from '@otl/server-nest/common/serializer/feeds.serializer'
import { session_userprofile } from '@prisma/client'

import { FeedsService } from './feeds.service'

@Controller('api/users/:userId/feeds')
export class FeedsController {
  constructor(private readonly feedsService: FeedsService) {}

  @Get()
  async getUserFeeds(@Query() query: IFeed.QueryDto, @GetUser() user: session_userprofile): Promise<IFeed.Details[]> {
    const feeds = await this.feedsService.getFeeds(query, user)
    return feeds.map((feed) => toJsonFeedDetails(feed, user))
  }
}
