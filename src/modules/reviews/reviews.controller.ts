import { Body, Controller, Get, HttpException, Post, Query } from '@nestjs/common';
import { GetReviewDto, PostReviewDto } from 'src/common/interfaces/dto/reviews/reviews.request.dto';
import { ReviewsRepository } from 'src/prisma/repositories/review.repository';
import { ReviewsService } from './reviews.service';
import { ReviewResponseDto } from 'src/common/interfaces/dto/reviews/review.response.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { session_userprofile } from '@prisma/client';

@Controller('api/reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly reviewsRepository: ReviewsRepository,
  ) {}
  @Get()
  async getReviews(
    @Query() reviewsParam: GetReviewDto,
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
    @Body() reviewsBody: PostReviewDto,
    @GetUser() user: session_userprofile,
  ): Promise<(ReviewResponseDto & { userspecific_is_liked: boolean })> {
    if (user) {
      const result = await this.reviewsService.postReviews(reviewsBody, user);
      return result;
    } else {
      throw new HttpException("Can't find user", 401);
    }
  }
}
