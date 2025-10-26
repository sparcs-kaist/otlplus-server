import {
  HttpException, HttpStatus, Inject, Injectable,
} from '@nestjs/common'
import { Transactional } from '@nestjs-cls/transactional'
import { IReviewV2 } from '@otl/server-nest/common/interfaces/v2'
import { toJsonReviewV2 } from '@otl/server-nest/common/serializer/v2/review.v2.serializer'
import { UNDERGRADUATE_DEPARTMENTS } from '@otl/server-nest/modules/departments/departments.service'
import { REVIEW_MQ, ReviewMQ } from '@otl/server-nest/modules/reviews/domain/out/ReviewMQ'
import { review_review, session_userprofile, subject_department } from '@prisma/client'

import logger from '@otl/common/logger/logger'
import { getRandomChoice } from '@otl/common/utils/util'

import { EReview } from '@otl/prisma-client'
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
    user: session_userprofile | null,
    language: string = 'kr',
  ): Promise<IReviewV2.GetResponseDto> {
    const MAX_LIMIT = 50
    const DEFAULT_ORDER = ['-written_datetime', '-id']

    let reviews: review_review[] = []
    let department: subject_department | null = null

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
        ({ reviews, department } = await this.getPopularFeedReviews(reviewsParam, user, MAX_LIMIT))
        break
      default:
        reviews = await this.getDefaultReviews(reviewsParam, DEFAULT_ORDER, MAX_LIMIT)
    }

    const reviewsWithLiked = reviews.map((review) => toJsonReviewV2(review as EReview.Extended, user, language))

    // 평균 계산
    const averageGrade = this.calculateAverage(reviewsWithLiked, 'grade')
    const averageLoad = this.calculateAverage(reviewsWithLiked, 'load')
    const averageSpeech = this.calculateAverage(reviewsWithLiked, 'speech')

    // 사용자가 작성한 리뷰 ID 찾기
    const myReviewId = user
      ? reviewsWithLiked.filter((review) => review.professor.id === user.id).map((review) => review.id)
      : []

    return {
      reviews: reviewsWithLiked,
      averageGrade,
      averageLoad,
      averageSpeech,
      myReviewId,
      department,
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

  private async getPopularFeedReviews(
    reviewsParam: IReviewV2.QueryDto,
    user: session_userprofile | null,
    maxLimit: number,
  ): Promise<{ reviews: review_review[], department: subject_department | null }> {
    // randomly select between HSS or other departments
    const isHSS = Math.random() < 0.2
    if (isHSS) {
      const humanityBestReviews = await this.reviewsRepository.getRandomNHumanityBestReviews(
        reviewsParam.limit ?? maxLimit,
      )
      const reviews = await this.reviewsRepository.getReviewsByIds(
        humanityBestReviews.map((review) => review.review_id),
      )
      return {
        reviews,
        department: null,
      }
    }
    // 주요 전공을 선택하여 인기 후기를 반환
    let departments: subject_department[]
    if (user) {
      // 로그인: 관심 전공
      const relatedDepartments = await this.departmentRepository.getRelatedDepartments(user)
      departments = relatedDepartments.filter((d) => UNDERGRADUATE_DEPARTMENTS.includes(d.code))
    }
    else {
      const allDepartments = await this.departmentRepository.getAllDepartmentOptions([])
      departments = allDepartments.filter((d) => UNDERGRADUATE_DEPARTMENTS.includes(d.code))
    }

    // 전공이 없는 경우 빈 배열 반환
    if (!departments || departments.length === 0) {
      return { reviews: [], department: null }
    }

    // random select
    const selectedDepartment = getRandomChoice(departments)
    const majorBestReviews = await this.reviewsRepository.getRandomNMajorBestReviews(
      reviewsParam.limit ?? maxLimit,
      selectedDepartment,
    )
    const reviews = await this.reviewsRepository.getReviewsByIds(majorBestReviews.map((review) => review.review_id))
    return {
      reviews,
      department: selectedDepartment,
    }
  }

  private calculateAverage(reviews: IReviewV2.Basic[], field: 'grade' | 'load' | 'speech'): number {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review[field], 0)
    return Math.round((sum / reviews.length) * 100) / 100 // 소수점 둘째 자리까지
  }

  async getReviewsCountV2(lectureYear?: number, lectureSemester?: number): Promise<number> {
    return await this.reviewsRepository.getReviewsCount(lectureYear, lectureSemester)
  }

  @Transactional()
  async createReviewV2(reviewBody: IReviewV2.CreateDto, user: session_userprofile): Promise<EReview.Basic> {
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

    return review
  }
}
