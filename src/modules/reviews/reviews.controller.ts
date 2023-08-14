import { Body, Controller, Get, HttpException, Param, Patch, Post, Query } from '@nestjs/common';
import {
  getReviewDto,
  postReviewDto,
  patchReviewDto,
} from 'src/common/interfaces/dto/reviews/reviews.request.dto';
import { ReviewsRepository } from 'src/prisma/repositories/review.repository';
import { ReviewsService } from './reviews.service';
import { ReviewResponseDto } from 'src/common/interfaces/dto/reviews/review.response.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { session_userprofile } from '@prisma/client';

@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}
  @Get()
  async getReviews(
    @Query() reviewsParam: getReviewDto,
    @GetUser() user,
  ): Promise<
    (ReviewResponseDto & { userspecific_is_liked: boolean })[] | number
  > {
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

  @Post()
  async postReviews(
    @Body() reviewsBody: postReviewDto,
    @GetUser() user: session_userprofile,
  ): Promise<ReviewResponseDto & { userspecific_is_liked: boolean }> {
    if (user) {
      const result = await this.reviewsService.postReviews(reviewsBody, user);
      return result;
    } else {
      throw new HttpException("Can't find user", 401);
    }
  }

  @Get(':reviewId')
  async getReviewInstance(
    @Param('reviewId') reviewId: number,
    @GetUser() user: session_userprofile,
  ): Promise<ReviewResponseDto & { userspecific_is_liked: boolean }> {
    return await this.reviewsService.getReviewById(reviewId, user);
  }

  @Patch(':reviewId')
  async patchReviewInstance(
    @Body() reviewsBody: patchReviewDto,
    @Param('reviewId') reviewId: number,
    @GetUser() user: session_userprofile,
  ): Promise<ReviewResponseDto & { userspecific_is_liked: boolean }> {
    if (user) {
      return await this.reviewsService.patchReviewById(reviewId, user, reviewsBody);
    } else {
      throw new HttpException("Can't find user", 401);
    }
  }
}
