import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common'
import { GetLanguage, Language } from '@otl/server-nest/common/decorators/get-language.decorator'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { ReviewProhibited } from '@otl/server-nest/common/decorators/prohibit-review.decorator'
import { Public } from '@otl/server-nest/common/decorators/skip-auth.decorator'
import { IReviewV2 } from '@otl/server-nest/common/interfaces/v2/IReviewV2'
import { session_userprofile } from '@prisma/client'
import { Request } from 'express'

import { ReviewsServiceV2 } from './reviews.service'

@Controller('api/v2/reviews')
export class ReviewsControllerV2 {
  constructor(private readonly reviewsV2Service: ReviewsServiceV2) {}

  @Public()
  @Get()
  async getReviews(
    @Query() reviewsParam: IReviewV2.QueryDto,
    @GetUser() user: session_userprofile | undefined,
    @GetLanguage() language: Language,
  ): Promise<IReviewV2.GetResponseDto | number> {
    if (reviewsParam.mode === 'default' && !reviewsParam.courseId) {
      throw new HttpException('default 모드에서는 courseId가 필요합니다', HttpStatus.BAD_REQUEST)
    }

    const result = await this.reviewsV2Service.getReviewsV2(reviewsParam, user || null, language)
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
    return { id: result.id }
  }

  @Put('/:reviewId')
  async updateReviewV2(
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Body() reviewBody: IReviewV2.UpdateDto,
    @GetUser() user: session_userprofile,
  ): Promise<IReviewV2.UpdateResponseDto> {
    if (!user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
    }

    return await this.reviewsV2Service.updateReviewV2(reviewId, reviewBody, user)
  }

  @Patch('/:reviewId/liked')
  async patchReviewLike(
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Body() body: IReviewV2.PatchLikedDto,
    @GetUser() user: session_userprofile,
  ): Promise<IReviewV2.UpdateResponseDto> {
    if (reviewId !== body.reviewId) {
      throw new HttpException('Path param and body id not match', HttpStatus.BAD_REQUEST)
    }
    return await this.reviewsV2Service.updateReviewLiked(body, user)
  }
}
