import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { getReviewDto } from 'src/common/interfaces/dto/reviews/reviews.request.dto';
import { ReviewsRepository } from 'src/prisma/repositories/review.repository';
import { ReviewsService } from './reviews.service';
import { ReviewResponseDto } from 'src/common/interfaces/dto/reviews/review.response.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { session_userprofile } from 'src/prisma/generated/prisma-class/session_userprofile';
 
@Controller('api/reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly reviewsRepository: ReviewsRepository,
  ) {}
  @Get()
  async getReviews(
    @Query() reviewsParam: getReviewDto,
    @GetUser() user: session_userprofile,
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

  /*@Post()
  async postReviews(@Body() reviewsBody: postReviewDto,@GetUser() user: session_userprofile): Promise<any> {
    if(user){
      const lecture = user.
    }
  }*/
}
