import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { ReviewResponseDto } from 'src/common/interfaces/dto/reviews/review.response.dto';
import {
  ReviewCreateDto,
  ReviewQueryDto,
  ReviewUpdateDto,
} from 'src/common/interfaces/dto/reviews/reviews.request.dto';
import { toJsonReview } from 'src/common/interfaces/serializer/review.serializer';
import { LectureRepository } from 'src/prisma/repositories/lecture.repository';
import { ReviewsRepository } from 'src/prisma/repositories/review.repository';

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
    reviewsParam: ReviewQueryDto,
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
    lectureYear: number,
    lectureSemester: number,
  ): Promise<number> {
    return await this.reviewsRepository.getReviewsCount(
      lectureYear,
      lectureSemester,
    );
  }

  async createReviews(
    reviewsBody: ReviewCreateDto,
    user: session_userprofile,
  ): Promise<ReviewResponseDto & { userspecific_is_liked: boolean }> {
    const reviewWritableLectures =
      await this.lectureRepository.findReviewWritableLectures(user, new Date());
    const reviewLecture = reviewWritableLectures.find((lecture) => {
      return lecture.id == reviewsBody.lecture;
    });
    if (reviewLecture == undefined)
      throw new HttpException("Can't find lecture", 404);
    const review = await this.reviewsRepository.upsertReview(
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

  async updateReviewById(
    reviewId: number,
    user: session_userprofile,
    reviewBody: ReviewUpdateDto,
  ): Promise<ReviewResponseDto & { userspecific_is_liked: boolean }> {
    const review = await this.reviewsRepository.getReviewById(reviewId);
    if (review == undefined) throw new HttpException("Can't find review", 404);
    if (review.writer_id !== user.id)
      throw new HttpException("Can't find user", 401);
    if (review.is_deleted)
      throw new HttpException(
        'Target review deleted by admin',
        HttpStatus.BAD_REQUEST,
      );
    const updateReview = await this.reviewsRepository.updateReview(
      review.id,
      reviewBody.content,
      reviewBody.grade,
      reviewBody.load,
      reviewBody.speech,
    );
    const result = toJsonReview(updateReview);
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
