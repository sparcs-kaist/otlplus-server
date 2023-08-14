import { toJsonReview } from 'src/common/interfaces/serializer/review.serializer';
import { getReviewDto, patchReviewDto, postReviewDto } from 'src/common/interfaces/dto/reviews/reviews.request.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ReviewsRepository } from 'src/prisma/repositories/review.repository';
import { ReviewResponseDto } from 'src/common/interfaces/dto/reviews/review.response.dto';
import { session_userprofile } from '@prisma/client';
import { LectureRepository } from 'src/prisma/repositories/lecture.repository';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly lectureRepository: LectureRepository,
  ) {}

  async getReviewById(
    reviewId: number,
    user: session_userprofile,
  ): Promise<ReviewResponseDto & { userspecific_is_liked: boolean }> {
    const review = await this.reviewsRepository.getReviewById(reviewId);
    if (review == undefined) throw new HttpException("Can't find review", 404);
    const result = toJsonReview(review);
    if (user) {
      const isLiked: boolean = await this.reviewsRepository.isLiked(
        review.id,
        user.id,
      );
      return Object.assign(result, {
        userspecific_is_liked: isLiked,
      });
    } else {
      return Object.assign(result, {
        userspecific_is_liked: false,
      });
    }
  }
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
    return await Promise.all(
      reviews.map(async (review) => {
        const result = toJsonReview(review);
        if (user) {
          const isLiked: boolean = await this.reviewsRepository.isLiked(
            review.id,
            user.id,
          );
          return Object.assign(result, {
            userspecific_is_liked: isLiked,
          });
        } else {
          return Object.assign(result, {
            userspecific_is_liked: false,
          });
        }
      }),
    );
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

  async postReviews(
    reviewsBody: postReviewDto,
    user: session_userprofile,
  ): Promise<ReviewResponseDto & { userspecific_is_liked: boolean }> {
    const reviewWritableLectures =
      await this.lectureRepository.findReviewWritableLectures(user, new Date());
    const reviewLecture = reviewWritableLectures.find((lecture) => {
      return lecture.id == reviewsBody.lecture;
    });
    if (reviewLecture == undefined)
      throw new HttpException("Can't find lecture", 401);
    const review = await this.reviewsRepository.newReview(
      reviewLecture.course_id,
      reviewLecture.id,
      reviewsBody.content,
      reviewsBody.grade,
      reviewsBody.load,
      reviewsBody.speech,
      user.id,
    );
    const result = toJsonReview(review);
    if (user) {
      const isLiked: boolean = await this.reviewsRepository.isLiked(
        review.id,
        user.id,
      );
      return Object.assign(result, {
        userspecific_is_liked: isLiked,
      });
    } else {
      return Object.assign(result, {
        userspecific_is_liked: false,
      });
    }
  }

  async patchReviewById(
    reviewId: number,
    user: session_userprofile,
    reviewBody: patchReviewDto,
  ): Promise<ReviewResponseDto & { userspecific_is_liked: boolean }> {
    const review = await this.reviewsRepository.getReviewById(reviewId);
    if (review == undefined) throw new HttpException("Can't find review", 404);
    if (review.writer_id !== user.id)
      throw new HttpException("Can't find user", 401);
    if (review.is_deleted)
      throw new HttpException('Target review deleted by admin',HttpStatus.BAD_REQUEST);
    const patchReview = await this.reviewsRepository.patchReview(
      review.id,
      reviewBody.content,
      reviewBody.grade,
      reviewBody.load,
      reviewBody.speech
    );
    const result = toJsonReview(patchReview);
    if (user) {
      const isLiked: boolean = await this.reviewsRepository.isLiked(
        review.id,
        user.id,
      );
      return Object.assign(result, {
        userspecific_is_liked: isLiked,
      });
    } else {
      return Object.assign(result, {
        userspecific_is_liked: false,
      });
    }
  }
}
