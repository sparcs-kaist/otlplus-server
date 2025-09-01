import {
  Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Query,
} from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { ReviewProhibited } from '@otl/server-nest/common/decorators/prohibit-review.decorator'
import { Public } from '@otl/server-nest/common/decorators/skip-auth.decorator'
import { IReview } from '@otl/server-nest/common/interfaces'
import { toJsonReviewVote } from '@otl/server-nest/common/serializer/review.serializer'
import { session_userprofile } from '@prisma/client'

import { ReviewsService } from './reviews.service'

@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get()
  async getReviews(
    @Query() reviewsParam: IReview.QueryDto,
    @GetUser() user: session_userprofile,
  ): Promise<IReview.WithLiked[] | number> {
    if (reviewsParam.response_type === 'count') {
      const reviewsCount = await this.reviewsService.getReviewsCount(
        reviewsParam.lecture_year,
        reviewsParam.lecture_semester,
      )
      return reviewsCount
    }
    const result = await this.reviewsService.getReviews(reviewsParam, user)
    return result
  }

  @ReviewProhibited()
  @Post()
  async createReviews(
    @Body() reviewsBody: IReview.CreateDto,
    @GetUser() user: session_userprofile,
  ): Promise<IReview.WithLiked> {
    if (user) {
      const result = await this.reviewsService.createReviews(reviewsBody, user)
      return result
    }
    throw new HttpException('Can\'t find user', 401)
  }

  @Public()
  @Get(':reviewId')
  async getReviewInstance(
    @Param('reviewId') reviewId: number,
    @GetUser() user: session_userprofile,
  ): Promise<IReview.WithLiked> {
    return await this.reviewsService.getReviewById(reviewId, user)
  }

  @Patch(':reviewId')
  async updateReviewInstance(
    @Body() reviewsBody: IReview.UpdateDto,
    @Param('reviewId') reviewId: number,
    @GetUser() user: session_userprofile,
  ): Promise<IReview.WithLiked> {
    if (user) {
      return await this.reviewsService.updateReviewById(reviewId, user, reviewsBody)
    }
    throw new HttpException('Can\'t find user', 401)
  }

  @Post(':reviewId/like')
  async likeReviewInstance(
    @Param('reviewId') reviewId: number,
    @GetUser() user: session_userprofile,
  ): Promise<IReview.IReviewVote.Basic> {
    const reviewVote = await this.reviewsService.findReviewVote(reviewId, user)
    if (reviewVote) {
      throw new HttpException('Already Liked', HttpStatus.BAD_REQUEST)
    }
    else {
      // @Todo : Message(REVIEW_LIKE) 보내기
      const result = await this.reviewsService.createReviewVote(reviewId, user)
      return toJsonReviewVote(result)
    }
  }

  @Delete(':reviewId/like')
  async unlikeReview(
    @Param('reviewId') reviewId: number,
    @GetUser() user: session_userprofile,
  ): Promise<IReview.IReviewVote.Basic> {
    const reviewVote = await this.reviewsService.findReviewVote(reviewId, user)
    // @Todo : Message(REVIEW_LIKE) 보내기
    if (!reviewVote) {
      throw new HttpException('Already UnLiked', HttpStatus.BAD_REQUEST)
    }
    else {
      const result = await this.reviewsService.deleteReviewVote(reviewId, user)
      return toJsonReviewVote(result)
    }
  }
}

@Controller('api/v2/reviews')
export class v2ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // 아직 개발 중인 api임. 코드 수정이 필요함.
  /*
  @Public()
  @Get()
  async getReviews(
    @Query() reviewsParam: IReview.v2QueryDto,
    @GetUser() user: session_userprofile,
  ): Promise<IReview.v2Response> {
    if (reviewsParam.response_type === 'count') {
      const reviewsCount = await this.reviewsService.getReviewsCount(
        reviewsParam.year,
        reviewsParam.semester,
      )
      return reviewsCount
    }
    const result = await this.reviewsService.getReviews(reviewsParam, user)
    return result
  }
  */
}
