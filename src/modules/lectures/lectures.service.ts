import { LectureQueryDto, LectureReviewsQueryDto } from 'src/common/interfaces/dto/lecture/lecture.request.dto';
import { LectureRepository } from './../../prisma/repositories/lecture.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { toJsonLecture } from 'src/common/interfaces/serializer/lecture.serializer';
import { LectureResponseDto } from 'src/common/interfaces/dto/lecture/lecture.response.dto';
import { toJsonReview } from 'src/common/interfaces/serializer/review.serializer';
import { ReviewsRepository } from 'src/prisma/repositories/review.repository';
import { session_userprofile } from '@prisma/client';
import { LectureDetails } from "../../common/schemaTypes/types";
import { ReviewResponseDto } from 'src/common/interfaces/dto/reviews/review.response.dto';

@Injectable()
export class LecturesService {
  constructor(
    private LectureRepository: LectureRepository,
    private reviewsRepository: ReviewsRepository,
  ) {}

  public async getLectureByFilter(
    query: LectureQueryDto,
  ): Promise<LectureResponseDto[]> {
    const queryResult = await this.LectureRepository.filterByRequest(query);
    return queryResult.map((lecture) => toJsonLecture<false>(lecture, false));
  }

  public async getLectureById(id: number): Promise<LectureResponseDto> {
    const queryResult = await this.LectureRepository.getLectureById(id);
    if (!queryResult) {
      throw new NotFoundException();
    }
    return toJsonLecture<false>(queryResult, false);
  }

  public async getLectureReviews(
    user: session_userprofile,
    lectureId: number,
    query: LectureReviewsQueryDto,
  ): Promise<(ReviewResponseDto & { userspecific_is_liked: boolean })[]> {
    const MAX_LIMIT = 100;
    const DEFAULT_ORDER = ['-written_datetime', '-id'];
    const lecture = await this.LectureRepository.getLectureReviewsById(
      lectureId,
      query.order ?? DEFAULT_ORDER,
      query.offset ?? 0,
      query.limit ?? MAX_LIMIT,
    );
    const reviews = lecture.review;
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

  public async getLecturesByIds(ids: number[]): Promise<LectureDetails[]> {
    return await this.LectureRepository.getLectureByIds(ids);
  }
}
