import { Injectable } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { ELecture } from 'src/common/entities/ELecture';
import { ILecture } from 'src/common/interfaces/ILecture';
import {
  LectureQueryDto,
  LectureReviewsQueryDto,
} from 'src/common/interfaces/dto/lecture/lecture.request.dto';
import { LectureResponseDto } from 'src/common/interfaces/dto/lecture/lecture.response.dto';
import { ReviewResponseDto } from 'src/common/interfaces/dto/reviews/review.response.dto';
import { toJsonLecture } from 'src/common/interfaces/serializer/lecture.serializer';
import { toJsonReview } from 'src/common/interfaces/serializer/review.serializer';
import { ReviewsRepository } from 'src/prisma/repositories/review.repository';
import { LectureDetails } from '../../common/schemaTypes/types';
import { LectureRepository } from './../../prisma/repositories/lecture.repository';

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
    const reviews = lecture?.review ? lecture.review : [];
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

  async getLectureAutocomplete(dto: ILecture.AutocompleteDto) {
    const candidate = await this.LectureRepository.getLectureAutocomplete(dto);
    if (!candidate) return dto.keyword;
    return this.findAutocompleteFromCandidate(candidate, dto.keyword);
  }

  private findAutocompleteFromCandidate(
    candidate: ELecture.Extended,
    keyword: string,
  ) {
    const keywordLower = keyword.toLowerCase();
    if (candidate.subject_department.name.startsWith(keyword))
      return candidate.subject_department.name;
    if (
      candidate.subject_department.name_en
        ?.toLowerCase()
        .startsWith(keywordLower)
    )
      return candidate.subject_department.name_en;
    if (candidate.title.startsWith(keyword)) return candidate.title;
    if (candidate.title_en.toLowerCase().startsWith(keywordLower))
      return candidate.title_en;
    for (const professor of candidate.subject_lecture_professors) {
      if (professor.professor.professor_name.startsWith(keyword))
        return professor.professor.professor_name;
      if (
        professor.professor.professor_name_en
          ?.toLowerCase()
          .startsWith(keywordLower)
      )
        return professor.professor.professor_name_en;
    }
  }
}
