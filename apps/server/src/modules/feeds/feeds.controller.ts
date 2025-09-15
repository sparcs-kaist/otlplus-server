import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager'
import {
  Controller, ExecutionContext, Get, Query, UseInterceptors,
} from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { IFeed } from '@otl/server-nest/common/interfaces'
import { toJsonFeedDetails } from '@otl/server-nest/common/serializer/feeds.serializer'
import { session_userprofile } from '@prisma/client'

import { FeedsService } from './feeds.service'

@Controller('api/users/:userId/feeds')
export class FeedsController {
  constructor(private readonly feedsService: FeedsService) {}

  private static cacheTTLFactory = (_context: ExecutionContext): number => {
    const now = new Date()

    const KST_OFFSET = 9 * 60 // 9시간 -> 분 단위
    const nowKST = new Date(now.getTime() + KST_OFFSET * 60 * 1000)

    const midnightKST = new Date(nowKST)
    midnightKST.setHours(24, 0, 0, 0)

    // TTL (초 단위)
    const ttlInSeconds = Math.floor((midnightKST.getTime() - nowKST.getTime()) / 1000)
    return ttlInSeconds * 1000 // 밀리초 단위로 변환
  }

  @CacheTTL(FeedsController.cacheTTLFactory)
  @UseInterceptors(CacheInterceptor)
  @Get()
  async getUserFeeds(@Query() query: IFeed.QueryDto, @GetUser() user: session_userprofile): Promise<IFeed.Details[]> {
    const feeds = await this.feedsService.getFeeds(query, user)
    return feeds.map((feed) => toJsonFeedDetails(feed, user))
  }
}
