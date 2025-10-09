import {
  Body, Controller, Get, HttpException, HttpStatus, Post, Query, Req,
} from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { ReviewProhibited } from '@otl/server-nest/common/decorators/prohibit-review.decorator'
import { Public } from '@otl/server-nest/common/decorators/skip-auth.decorator'
import { IReviewV2 } from '@otl/server-nest/common/interfaces/v2/IReviewV2'
import { session_userprofile } from '@prisma/client'
import { Request } from 'express'

import { ReviewsV2Service } from './reviews.v2.service'

@Controller('api/v2/reviews')
export class ReviewsV2Controller {
  constructor(private readonly reviewsV2Service: ReviewsV2Service) {}

  @Public()
  @Get()
  async getReviews(
    @Query() reviewsParam: IReviewV2.QueryDto,
    @GetUser() user: session_userprofile,
    @Req() req: Request,
  ): Promise<IReviewV2.GetResponseDto | number> {
    const language = req.headers['accept-language']?.toString() || 'kr'

    if (reviewsParam.mode === 'hall-of-fame' && (!reviewsParam.year || !reviewsParam.semester)) {
      throw new HttpException('hall-of-fame 모드에서는 year와 semester가 필요합니다', HttpStatus.BAD_REQUEST)
    }

    const result = await this.reviewsV2Service.getReviewsV2(reviewsParam, user, language)
    return result
  }

  @ReviewProhibited()
  @Post()
  async createReviewV2(
    @Body() reviewBody: IReviewV2.CreateDto,
    @GetUser() user: session_userprofile,
    @Req() _req: Request,
  ): Promise<IReviewV2.CreateResponseDto> {
    if (!user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
    }

    const result = await this.reviewsV2Service.createReviewV2(reviewBody, user)
    return result
  }
}
