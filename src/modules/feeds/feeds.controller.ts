import { Controller, Get, Query } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { IFeed } from 'src/common/interfaces/dto/feeds/IFeed';
import { toJsonFeed } from 'src/common/interfaces/serializer/feeds.serializer';
import { FeedsService } from './feeds.service';

@Controller('api/users/:userId/feeds')
export class FeedsController {
  constructor(private readonly feedsService: FeedsService) {}

  @Get()
  async getUserFeeds(
    @Query() query: IFeed.QueryDto,
    @GetUser() user: session_userprofile,
  ) {
    const feeds = await this.feedsService.getFeeds(query, user);
    return feeds.map((feed) => toJsonFeed(feed));
  }
}
