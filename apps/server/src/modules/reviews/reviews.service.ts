import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Transactional } from '@nestjs-cls/transactional'
import { IReview } from '@otl/server-nest/common/interfaces'
import { toJsonReview } from '@otl/server-nest/common/serializer/review.serializer'
import { session_userprofile } from '@prisma/client'

import { EReview } from '@otl/prisma-client/entities'
import { LectureRepository, ReviewsRepository } from '@otl/prisma-client/repositories'
import EReviewVote = EReview.EReviewVote

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly lectureRepository: LectureRepository,
  ) {}

  async getReviewById(
    reviewId: number,
    user: session_userprofile,
  ): Promise<IReview.Basic & { userspecific_is_liked: boolean }> {
    const review = await this.reviewsRepository.getReviewById(reviewId)
    if (!review) throw new HttpException('Can\'t find review', 404)
    const result = toJsonReview(review)
    if (user) {
      const isLiked: boolean = await this.reviewsRepository.isLiked(review.id, user.id)
      return Object.assign(result, {
        userspecific_is_liked: isLiked,
      })
    }
    return Object.assign(result, {
      userspecific_is_liked: false,
    })
  }

  async getReviews(
    reviewsParam: IReview.QueryDto,
    user: session_userprofile,
  ): Promise<(IReview.Basic & { userspecific_is_liked: boolean })[]> {
    const MAX_LIMIT = 50
    const DEFAULT_ORDER = ['-written_datetime', '-id']
    const reviews = await this.reviewsRepository.getReviews(
      reviewsParam.order ?? DEFAULT_ORDER,
      reviewsParam.offset ?? 0,
      reviewsParam.limit ?? MAX_LIMIT,
      reviewsParam.lecture_year,
      reviewsParam.lecture_semester,
    )
    return await Promise.all(
      reviews.map(async (review) => {
        const result = toJsonReview(review)
        if (user) {
          const isLiked: boolean = await this.reviewsRepository.isLiked(review.id, user.id)
          return Object.assign(result, {
            userspecific_is_liked: isLiked,
          })
        }
        return Object.assign(result, {
          userspecific_is_liked: false,
        })
      }),
    )
  }

  async getReviewsCount(lectureYear?: number, lectureSemester?: number): Promise<number> {
    return await this.reviewsRepository.getReviewsCount(lectureYear, lectureSemester)
  }

  @Transactional()
  async createReviews(
    reviewsBody: IReview.CreateDto,
    user: session_userprofile,
  ): Promise<IReview.Basic & { userspecific_is_liked: boolean }> {
    const reviewWritableLectures = await this.lectureRepository.findReviewWritableLectures(user, new Date())
    const reviewLecture = reviewWritableLectures.find((lecture) => lecture.id === reviewsBody.lecture)
    if (reviewLecture === undefined) throw new HttpException('Can\'t find lecture', 404)
    const review = await this.reviewsRepository.upsertReview(
      reviewLecture.course_id,
      reviewLecture.id,
      reviewsBody.content,
      reviewsBody.grade,
      reviewsBody.load,
      reviewsBody.speech,
      user.id,
    )
    const result = toJsonReview(review)
    if (user) {
      const isLiked: boolean = await this.reviewsRepository.isLiked(review.id, user.id)
      return Object.assign(result, {
        userspecific_is_liked: isLiked,
      })
    }
    return Object.assign(result, {
      userspecific_is_liked: false,
    })
  }

  @Transactional()
  async updateReviewById(
    reviewId: number,
    user: session_userprofile,
    reviewBody: IReview.UpdateDto,
  ): Promise<IReview.Basic & { userspecific_is_liked: boolean }> {
    const review = await this.reviewsRepository.getReviewById(reviewId)
    if (!review) throw new HttpException('Can\'t find review', 404)
    if (review.writer_id !== user.id) throw new HttpException('Can\'t find user', 401)
    if (review.is_deleted) throw new HttpException('Target review deleted by admin', HttpStatus.BAD_REQUEST)
    const updateReview = await this.reviewsRepository.updateReview(
      review.id,
      reviewBody.content,
      reviewBody.grade,
      reviewBody.load,
      reviewBody.speech,
    )
    const result = toJsonReview(updateReview)
    if (user) {
      const isLiked: boolean = await this.reviewsRepository.isLiked(review.id, user.id)
      return Object.assign(result, {
        userspecific_is_liked: isLiked,
      })
    }
    return Object.assign(result, {
      userspecific_is_liked: false,
    })
  }

  async findReviewVote(reviewId: number, user: session_userprofile): Promise<boolean> {
    const review = await this.reviewsRepository.getReviewById(reviewId)
    if (!review) throw new HttpException('Can\'t find review', 404)
    const isLiked: boolean = await this.reviewsRepository.isLiked(review.id, user.id)
    return isLiked
  }

  @Transactional()
  async createReviewVote(reviewId: number, user: session_userprofile): Promise<EReviewVote.Basic> {
    return await this.reviewsRepository.upsertReviewVote(reviewId, user.id)
  }
}
