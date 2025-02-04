import { Controller, Get, Query } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { GetUser } from '@src/common/decorators/get-user.decorator';
import { FeedsService } from './feeds.service';
import { IFeed } from '@otl/api-interface/src/interfaces';
import { toJsonFeedDetails } from '@src/common/serializer/feeds.serializer';

@Controller('api/users/:userId/feeds')
export class FeedsController {
  constructor(private readonly feedsService: FeedsService) {}

  @Get()
  async getUserFeeds(@Query() query: IFeed.QueryDto, @GetUser() user: session_userprofile): Promise<IFeed.Details[]> {
    const feeds = await this.feedsService.getFeeds(query, user);
    return feeds.map((feed) => toJsonFeedDetails(feed, user));
  }
}
