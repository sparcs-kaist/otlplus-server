import { Controller, Get, Query } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UserFeedsQueryDto } from 'src/common/interfaces/dto/user/user.request.dto';
import { FeedsService } from './feeds.service';

@Controller('api/users/:user_id/feeds')
export class FeedsController {
  constructor(private readonly feedsService: FeedsService) {}

  @Get(':user_id/feeds')
  async getUserFeeds(
    /**
     * @todo use user by auth instead of userId by endpoint param
     * userId should be removed from endpoint in the future
     * since each user should only control their own timetable
     */
    @Query() query: UserFeedsQueryDto,
    @GetUser() user: session_userprofile,
  ): Promise<void> {
    return this.feedsService.getUserFeeds(query, user);
  }
}
