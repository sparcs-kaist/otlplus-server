import { toJsonReview } from 'src/common/interfaces/serializer/review.serializer';
import { getReviewDto } from 'src/common/interfaces/dto/reviews/reviews.request.dto';
import { Injectable } from '@nestjs/common';
import { ReviewsRepository } from 'src/prisma/repositories/review.repository';
import { ReviewResponseDto } from 'src/common/interfaces/dto/reviews/review.response.dto';
import { session_userprofile } from 'src/prisma/generated/prisma-class/session_userprofile';

@Injectable()
export class ReviewsService {
  constructor(private readonly reviewsRepository: ReviewsRepository) {}
  async getReviews(
    reviewsParam: getReviewDto,
    user: session_userprofile,
  ): Promise<(ReviewResponseDto & { userspecific_is_liked: boolean })[]> {
    const MAX_LIMIT = 50;
    const DEFAULT_ORDER = ['-written_datetime', '-id'];
    const reviews = await this.reviewsRepository.getReviews(
      reviewsParam.lecture_year,
      reviewsParam.lecture_semester,
      reviewsParam.order ?? DEFAULT_ORDER,
      reviewsParam.offset ?? 0,
      reviewsParam.limit ?? MAX_LIMIT,
    );
    return await Promise.all(reviews.map(async (review) => {
      const result = toJsonReview(review);
      if (user) {
        const isLiked: boolean =await this.reviewsRepository.isLiked(review.id, user.id);
        return Object.assign(result, {
          userspecific_is_liked: isLiked,
        });
      } else {
        return Object.assign(result, {
          userspecific_is_liked: false,
        });
      }
    }));
  }

  async getReviewsCount(
    lecture_year: number,
    lecture_semester: number,
  ): Promise<number> {
    return await this.reviewsRepository.getReviewsCount(
      lecture_year,
      lecture_semester,
    );
  }
}
