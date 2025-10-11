import {
  HttpException, HttpStatus, Inject, Injectable,
} from '@nestjs/common'
import { Transactional } from '@nestjs-cls/transactional'
import { IReview } from '@otl/server-nest/common/interfaces/IReview'
import { IReviewV2 } from '@otl/server-nest/common/interfaces/v2/IReviewV2'
import { toJsonReviewV2 } from '@otl/server-nest/common/serializer/v2/review.v2.serializer'
import { REVIEW_MQ, ReviewMQ } from '@otl/server-nest/modules/reviews/domain/out/ReviewMQ'
import { session_userprofile } from '@prisma/client'

import logger from '@otl/common/logger/logger'
import { getRandomChoice } from '@otl/common/utils/util'

import {
  CourseRepository,
  DepartmentRepository,
  LectureRepository,
  ReviewsRepository,
} from '@otl/prisma-client/repositories'

@Injectable()
export class ReviewsV2Service {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly lectureRepository: LectureRepository,
    private readonly courseRepository: CourseRepository,
    private readonly departmentRepository: DepartmentRepository,
    @Inject(REVIEW_MQ)
    private readonly reviewMQ: ReviewMQ,
  ) {}

  async getReviewsV2(
    reviewsParam: IReviewV2.QueryDto,
    user: session_userprofile,
    language: string = 'kr',
  ): Promise<IReviewV2.GetResponseDto> {
    const MAX_LIMIT = 50
    const DEFAULT_ORDER = ['-written_datetime', '-id']

    let reviews: any[] = []

    // 모드에 따른 리뷰 조회
    switch (reviewsParam.mode) {
      case 'default':
        reviews = await this.getDefaultReviews(reviewsParam, DEFAULT_ORDER, MAX_LIMIT)
        break
      case 'recent':
        reviews = await this.getRecentReviews(reviewsParam, MAX_LIMIT)
        break
      case 'hall-of-fame':
        reviews = await this.getHallOfFameReviews(reviewsParam, MAX_LIMIT)
        break
      case 'popular-feed':
        reviews = await this.getPopularFeedReviews(reviewsParam, user, MAX_LIMIT)
        break
      default:
        reviews = await this.getDefaultReviews(reviewsParam, DEFAULT_ORDER, MAX_LIMIT)
    }

    const reviewsWithLiked = reviews.map((review) => toJsonReviewV2(review, user, language))

    // 평균 계산
    const averageGrade = this.calculateAverage(reviewsWithLiked, 'grade')
    const averageLoad = this.calculateAverage(reviewsWithLiked, 'load')
    const averageSpeech = this.calculateAverage(reviewsWithLiked, 'speech')

    // 사용자가 작성한 리뷰 ID 찾기
    const myReviewId = user
      ? reviewsWithLiked.filter((review) => review.professor.professor_id === user.id).map((review) => review.id)
      : []

    return {
      reviews: reviewsWithLiked,
      averageGrade,
      averageLoad,
      averageSpeech,
      myReviewId,
    }
  }

  private async getDefaultReviews(reviewsParam: IReviewV2.QueryDto, defaultOrder: string[], maxLimit: number) {
    if (reviewsParam.courseId && reviewsParam.professorId) {
      // courseId + professorId: 해당 교수의 해당 강의 모든 년도 후기
      return await this.reviewsRepository.getReviewsByCourseAndProfessor(
        defaultOrder,
        reviewsParam.offset ?? 0,
        reviewsParam.limit ?? maxLimit,
        reviewsParam.courseId,
        reviewsParam.professorId,
      )
    }

    if (reviewsParam.courseId) {
      // courseId만: 해당 강의의 모든 교수 모든 년도 후기
      return await this.courseRepository.getReviewsByCourseId(
        {
          order: defaultOrder,
          offset: reviewsParam.offset ?? 0,
          limit: reviewsParam.limit ?? maxLimit,
        },
        reviewsParam.courseId,
      )
    }
    // 일반 검색
    return await this.reviewsRepository.getReviews(
      defaultOrder,
      reviewsParam.offset ?? 0,
      reviewsParam.limit ?? maxLimit,
      reviewsParam.year,
      reviewsParam.semester,
    )
  }

  private async getRecentReviews(reviewsParam: IReviewV2.QueryDto, maxLimit: number) {
    // 따끈따끈 과목후기 - 최근 작성된 순으로 정렬
    return await this.reviewsRepository.getReviews(
      ['-written_datetime', '-id'],
      reviewsParam.offset ?? 0,
      reviewsParam.limit ?? maxLimit,
      reviewsParam.year,
      reviewsParam.semester,
    )
  }

  private async getHallOfFameReviews(reviewsParam: IReviewV2.QueryDto, maxLimit: number) {
    // 명예의 전당 - 좋아요 수가 많은 순으로 정렬
    return await this.reviewsRepository.getReviews(
      ['-like', '-written_datetime'],
      reviewsParam.offset ?? 0,
      reviewsParam.limit ?? maxLimit,
      reviewsParam.year,
      reviewsParam.semester,
    )
  }

  private async getPopularFeedReviews(reviewsParam: IReviewV2.QueryDto, user: session_userprofile, maxLimit: number) {
    // 메인페이지 사랑받는 전공후기 - 사용자가 지정한 전공의 인기 후기를 반환
    const departments = await this.departmentRepository.getRelatedDepartments(user)
    // random select
    const selectedDepartment = getRandomChoice(departments)
    const majorBestReviews = await this.reviewsRepository.getRandomNMajorBestReviews(
      reviewsParam.limit ?? maxLimit,
      selectedDepartment,
    )
    return this.reviewsRepository.getReviewsByIds(majorBestReviews.map((review) => review.review_id))
  }

  private calculateAverage(reviews: IReview.Basic[], field: 'grade' | 'load' | 'speech'): number {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review[field], 0)
    return Math.round((sum / reviews.length) * 100) / 100 // 소수점 둘째 자리까지
  }

  async getReviewsCountV2(lectureYear?: number, lectureSemester?: number): Promise<number> {
    return await this.reviewsRepository.getReviewsCount(lectureYear, lectureSemester)
  }

  @Transactional()
  async createReviewV2(
    reviewBody: IReviewV2.CreateDto,
    user: session_userprofile,
  ): Promise<IReviewV2.CreateResponseDto> {
    // 해당 강의가 존재하는지 확인
    const lecture = await this.lectureRepository.findLectureByYearSemesterAndProfessor(
      reviewBody.year,
      reviewBody.semester,
      reviewBody.professorId,
    )

    if (!lecture) {
      throw new HttpException('didn\'t take class or invalid params', HttpStatus.BAD_REQUEST)
    }

    // 해당 강의에 대한 후기 작성 권한 확인
    const reviewWritableLectures = await this.lectureRepository.findReviewWritableLectures(user, new Date())
    const reviewLecture = reviewWritableLectures.find((l) => l.id === lecture.id)

    if (!reviewLecture) {
      throw new HttpException('didn\'t take class or invalid params', HttpStatus.BAD_REQUEST)
    }

    // 후기 생성
    const review = await this.reviewsRepository.upsertReview(
      reviewBody.courseId,
      lecture.id,
      reviewBody.content,
      reviewBody.grade,
      reviewBody.load,
      reviewBody.speech,
      user.id,
    )

    // 통계 업데이트 메시지 발송
    await Promise.all([
      await this.reviewMQ.publishCourseScoreUpdate(review.course_id),
      await Promise.all(
        review.lecture.subject_lecture_professors.map(async (professor) => {
          await this.reviewMQ.publishProfessorScoreUpdate(professor.id)
        }),
      ),
      await this.reviewMQ.publishLectureScoreUpdate(review.lecture_id),
    ]).catch((e) => {
      logger.error(`Error while publishing review score update: ${e.message}`, e)
    })

    return { id: review.id }
  }

  @Transactional()
  async updateReviewLiked(body: IReviewV2.PatchLikedDto, user: session_userprofile): Promise<number> {
    const review = await this.reviewsRepository.getReviewById(body.reviewId)
    if (!review) {
      throw new HttpException('Can\'t find review', HttpStatus.BAD_REQUEST)
    }

    const alreadyLiked = await this.reviewsRepository.isLiked(body.reviewId, user.id)

    // todo: 중복 요청 오류 처리할지 말지
    switch (body.action) {
      case 'like':
        if (alreadyLiked) {
          throw new HttpException('Requested for like, but already liked', HttpStatus.BAD_REQUEST)
        }
        await this.reviewsRepository.upsertReviewVote(body.reviewId, user.id)
        break
      case 'unlike':
        if (!alreadyLiked) {
          throw new HttpException('Requested for unlike, but not liked yet', HttpStatus.BAD_REQUEST)
        }
        await this.reviewsRepository.deleteReviewVote(body.reviewId, user.id)
        break
      default:
        throw new HttpException(`Invalid action: ${body.action}`, HttpStatus.BAD_REQUEST)
    }

    await this.reviewMQ.publishReviewLikeUpdate(body.reviewId).catch((e) => {
      logger.error(`Error while publishing review like update: ${e.message}`, e)
    })

    return 0
  }
}
