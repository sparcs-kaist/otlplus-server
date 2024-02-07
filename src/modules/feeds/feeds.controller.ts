import { Controller, Get, Query } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { toJsonFeedDetails } from 'src/common/interfaces/serializer/feeds.serializer';
import { IFeed } from 'src/common/interfaces/structures/IFeed';
import { FeedsService } from './feeds.service';

@Controller('api/users/:userId/feeds')
export class FeedsController {
  constructor(private readonly feedsService: FeedsService) {}

  @Get()
  async getUserFeeds(
    @Query() query: IFeed.QueryDto,
    @GetUser() user: session_userprofile,
  ): Promise<IFeed.IDetials[]> {
    const feeds = await this.feedsService.getFeeds(query, user);
    return feeds.map((feed) => toJsonFeedDetails(feed));
  }
}
