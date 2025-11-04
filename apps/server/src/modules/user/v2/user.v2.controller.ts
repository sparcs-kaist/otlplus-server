import {
  Controller, Get, HttpException, HttpStatus, Param, ParseIntPipe,
} from '@nestjs/common'
import { GetLanguage } from '@otl/server-nest/common/decorators/get-language.decorator'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { IReviewV2 } from '@otl/server-nest/common/interfaces/v2/IReviewV2'
import { session_userprofile } from '@prisma/client'

import { UserV2Service } from './user.v2.service'

@Controller('api/v2/users')
export class UserV2Controller {
  constructor(private readonly userV2Service: UserV2Service) {}

  @Get(':userId/reviews/liked')
  async getUserLikedReviews(
    @Param('userId', ParseIntPipe) userId: number,
    @GetUser() user: session_userprofile,
    @GetLanguage() language: string,
  ): Promise<{ reviews: IReviewV2.Basic[] }> {
    if (userId !== user.id) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
    }
    const reviews = await this.userV2Service.getUserLikedReviews(user, language)
    return { reviews }
  }
}
