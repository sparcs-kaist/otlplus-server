import { Body, Controller, Get, HttpException, Post, Query, Param, Patch} from '@nestjs/common';
import { ReviewQueryDto, ReviewUpdateDto, ReviewCreateDto } from "src/common/interfaces/dto/reviews/reviews.request.dto";
import { ReviewsService } from './reviews.service';
import { ReviewResponseDto } from 'src/common/interfaces/dto/reviews/review.response.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { session_userprofile } from '@prisma/client';

@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}
  @Get()
  async getReviews(
    @Query() reviewsParam: ReviewQueryDto,
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
  async createReviews(
    @Body() reviewsBody: ReviewCreateDto,
    @GetUser() user: session_userprofile,
  ): Promise<ReviewResponseDto & { userspecific_is_liked: boolean }> {
    if (user) {
      const result = await this.reviewsService.createReviews(reviewsBody, user);
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
  async updateReviewInstance(
    @Body() reviewsBody: ReviewUpdateDto,
    @Param('reviewId') reviewId: number,
    @GetUser() user: session_userprofile,
  ): Promise<ReviewResponseDto & { userspecific_is_liked: boolean }> {
    if (user) {
      return await this.reviewsService.updateReviewById(reviewId, user, reviewsBody);
    } else {
      throw new HttpException("Can't find user", 401);
    }
  }
}
