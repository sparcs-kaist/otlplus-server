import { Body, Controller, Get, HttpException, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { ReviewProhibited } from '@src/common/decorators/prohibit-review.decorator';
import { GetUser } from '@src/common/decorators/get-user.decorator';
import { Public } from '@src/common/decorators/skip-auth.decorator';
import { ReviewsService } from './reviews.service';
import { IReview } from '@otl/api-interface/src/interfaces';
import { toJsonReviewVote } from '@src/common/serializer/review.serializer';

@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}
  @Public()
  @Get()
  async getReviews(
    @Query() reviewsParam: IReview.QueryDto,
    @GetUser() user: session_userprofile,
  ): Promise<(IReview.Basic & { userspecific_is_liked: boolean })[] | number> {
    if (reviewsParam.response_type === 'count') {
      const reviewsCount = await this.reviewsService.getReviewsCount(
        reviewsParam.lecture_year,
        reviewsParam.lecture_semester,
      );
      return reviewsCount;
    }
    const result = await this.reviewsService.getReviews(reviewsParam, user);
    return result;
  }

  @ReviewProhibited()
  @Post()
  async createReviews(
    @Body() reviewsBody: IReview.CreateDto,
    @GetUser() user: session_userprofile,
  ): Promise<IReview.Basic & { userspecific_is_liked: boolean }> {
    if (user) {
      const result = await this.reviewsService.createReviews(reviewsBody, user);
      return result;
    } else {
      throw new HttpException("Can't find user", 401);
    }
  }

  @Public()
  @Get(':reviewId')
  async getReviewInstance(
    @Param('reviewId') reviewId: number,
    @GetUser() user: session_userprofile,
  ): Promise<IReview.Basic & { userspecific_is_liked: boolean }> {
    return await this.reviewsService.getReviewById(reviewId, user);
  }

  @Patch(':reviewId')
  async updateReviewInstance(
    @Body() reviewsBody: IReview.UpdateDto,
    @Param('reviewId') reviewId: number,
    @GetUser() user: session_userprofile,
  ): Promise<IReview.Basic & { userspecific_is_liked: boolean }> {
    if (user) {
      return await this.reviewsService.updateReviewById(reviewId, user, reviewsBody);
    } else {
      throw new HttpException("Can't find user", 401);
    }
  }

  @Post(':reviewId/like')
  async likeReviewInstance(
    @Param('reviewId') reviewId: number,
    @GetUser() user: session_userprofile,
  ): Promise<IReview.IReviewVote.Basic> {
    const reviewVote = await this.reviewsService.findReviewVote(reviewId, user);
    if (reviewVote) {
      throw new HttpException('Already Liked', HttpStatus.BAD_REQUEST);
    } else {
      const result = await this.reviewsService.createReviewVote(reviewId, user);
      return toJsonReviewVote(result);
    }
  }
}
