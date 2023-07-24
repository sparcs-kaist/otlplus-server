import { Controller, Get, Query } from '@nestjs/common';
import { review_review } from '@prisma/client';
import { getReviewDto } from 'src/common/interfaces/reviews/reviews.dto';
import { ReviewsRepository } from 'src/prisma/repositories/review.repository';
import { ReviewsService } from './reviews.service';
 
@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService:ReviewsService,
    private readonly reviewsRepository:ReviewsRepository) {}

  @Get()
  async getReviews(
    @Query() reviewsParam: getReviewDto
  ): Promise<review_review[] | number> {
    const MAX_LIMIT = 50;
    const DEFAULT_ORDER = ['-written_datetime', '-id'];

    let reviews = this.reviewsService.getReviews(reviewsParam.lecture_year, reviewsParam.lecture_semester);

    if (responseType === 'count') {
      return reviews.getCount();
    }

    reviews = reviews.orderBy(DEFAULT_ORDER[0], 'DESC').addOrderBy(DEFAULT_ORDER[1], 'DESC').take(MAX_LIMIT);

    const result = await reviews.getMany();

    return result.map((review) => review.to_json(user)); // to_json 함수는 따로 구현 필요
  }

  @Post()
  async createReview(@Body() body: any): Promise<Review> {
    const { content, lecture, grade, load, speech } = body;

    const user = request.user;
    if (!user || !user.isAuthenticated) {
      throw new UnauthorizedException();
    }

    const user_profile = user.userProfile;
    const lectureEntity = await this.lectureRepository.findOne(lecture);

    if (!lectureEntity) {
      throw new NotFoundException('Lecture not found');
    }

    const course = lectureEntity.course;

    const review = new Review();
    review.course = course;
    review.lecture = lectureEntity;
    review.content = content;
    review.grade = grade;
    review.load = load;
    review.speech = speech;
    review.writer = user_profile;

    await this.reviewRepository.save(review);

    return review.to_json(user); // to_json 함수는 따로 구현 필요
  }
}

}
