import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Transactional } from '@nestjs-cls/transactional'
import { ICourseV2, IUserV2 } from '@otl/server-nest/common/interfaces'
import { IUserV2 as IUserV2Detailed } from '@otl/server-nest/common/interfaces/v2'
import { IReviewV2 } from '@otl/server-nest/common/interfaces/v2/IReviewV2'
import { toJsonReviewV2 } from '@otl/server-nest/common/serializer/v2/review.v2.serializer'
import { toJsonUserLecturesV2, toJsonWishlistV2 } from '@otl/server-nest/common/serializer/v2/user.serializer'
import { session_userprofile } from '@prisma/client'

import {
  CourseRepository,
  DepartmentRepository,
  LectureRepository,
  ReviewsRepository,
  UserRepositoryV2,
  WishlistRepository,
} from '@otl/prisma-client'
import { mapCourse } from '@otl/prisma-client/common/mapper/course'

function toJsonDepartment(major: any): any {
  // Safely extract department info from the lecture/major object.
  const dept = major
  return {
    id: dept.id,
    name: dept.name,
  }
}

@Injectable()
export class UserServiceV2 {
  constructor(
    private readonly lectureRepository: LectureRepository,
    private readonly reviewsRepository: ReviewsRepository,
    private readonly wishlistRepository: WishlistRepository,
    private readonly courseRepository: CourseRepository,
    private readonly userRepositoryV2: UserRepositoryV2,
    private readonly departmentRepository: DepartmentRepository,
  ) {}

  async getUserLectures(user: session_userprofile, acceptLanguage?: string): Promise<IUserV2Detailed.LecturesResponse> {
    const language = this.parseAcceptLanguage(acceptLanguage)

    // Fetch data in parallel
    const [takenLectures, writtenReviews] = await Promise.all([
      this.lectureRepository.getTakenLectures(user),
      this.reviewsRepository.findReviewByUser(user),
    ])

    // Create Set of reviewed lecture IDs for O(1) lookup
    const reviewedLectureIds = new Set(writtenReviews.map((review) => review.lecture_id))

    // Calculate total likes from user's reviews
    // review.like is the count of likes received by the review
    const totalLikesCount = writtenReviews.reduce((sum, review) => sum + (review.like || 0), 0)

    // Serialize and group lectures
    return toJsonUserLecturesV2(takenLectures, reviewedLectureIds, totalLikesCount, language)
  }

  async getWishlist(user: session_userprofile, acceptLanguage?: string): Promise<IUserV2Detailed.WishlistResponse> {
    const language = this.parseAcceptLanguage(acceptLanguage)

    // Fetch wishlist and taken lectures in parallel
    const [wishlist, takenLectures] = await Promise.all([
      this.wishlistRepository.getOrCreateWishlist(user.id),
      this.lectureRepository.getTakenLectures(user),
    ])

    // Create Set of taken course IDs for O(1) lookup
    const takenCourseIds = new Set(takenLectures.map((lecture) => lecture.course_id))

    // Get unique course IDs from wishlist lectures
    const courseIds = Array.from(
      new Set(wishlist.timetable_wishlist_lectures.map((wl) => wl.subject_lecture.course_id)),
    )

    // Fetch course information in batch
    const coursesRaw = await this.courseRepository.getCoursesByIds(courseIds)
    const courseMap = new Map(coursesRaw.map((course) => [course.id, mapCourse(course)]))

    // Serialize and group by course
    return toJsonWishlistV2(wishlist, courseMap, takenCourseIds, language)
  }

  @Transactional()
  async updateWishlist(user: session_userprofile, body: IUserV2Detailed.UpdateWishlistDto): Promise<void> {
    const wishlist = await this.wishlistRepository.getOrCreateWishlist(user.id)

    // Verify lecture exists
    const lecture = await this.lectureRepository.getLectureDetailById(body.lectureId)
    if (!lecture) {
      throw new NotFoundException(`Lecture with id ${body.lectureId} does not exist`)
    }

    // Check if lecture is already in wishlist
    const existingLecture = await this.wishlistRepository.getLectureInWishlist(wishlist.id, body.lectureId)

    if (body.mode === 'add') {
      if (existingLecture) {
        throw new BadRequestException('Lecture already in wishlist')
      }
      await this.wishlistRepository.addLecture(wishlist.id, body.lectureId)
    }
    else if (body.mode === 'delete') {
      if (!existingLecture) {
        throw new BadRequestException('Lecture not in wishlist')
      }
      await this.wishlistRepository.removeLecture(wishlist.id, body.lectureId)
    }
  }

  async getUnreviewedRandomCourse(user: session_userprofile): Promise<ICourseV2.WritableReview | null> {
    const WrittenReviews = await this.reviewsRepository.findReviewByUser(user)
    const TakenLectures = await this.lectureRepository.getTakenLectures(user)
    let UnreviewedLectures = TakenLectures
    for (const review of WrittenReviews) {
      UnreviewedLectures = UnreviewedLectures.filter((lecture) => lecture.id !== review.lecture_id)
    }
    if (UnreviewedLectures.length === 0) {
      return null
    }
    const RandomUnreviewedLecture = UnreviewedLectures[Math.floor(Math.random() * UnreviewedLectures.length)]
    const professsors = RandomUnreviewedLecture.subject_lecture_professors
    const professors_basic = professsors.map((professor) => ({
      id: professor.professor.professor_id,
      name: professor.professor.professor_name,
    }))
    return {
      id: RandomUnreviewedLecture.course_id,
      name: RandomUnreviewedLecture.title,
      professor: professors_basic,
      year: RandomUnreviewedLecture.year,
      semester: RandomUnreviewedLecture.semester,
      totalRemainingCount: UnreviewedLectures.length,
    }
  }

  async getUserInfo(user: session_userprofile): Promise<IUserV2.Info | null> {
    const name = `${user.first_name} ${user.last_name}`
    const mail = user.email || ''
    const studentNumber = parseInt(user.student_id)
    const degree = (user as any).degree || null
    const [favoriteDepartments, majors] = await Promise.all([
      this.departmentRepository.getFavoriteDepartments(user),
      this.departmentRepository.getMajors(user),
    ])

    return {
      name,
      mail,
      studentNumber,
      degree,
      majorDepartments: majors.map((major) => toJsonDepartment(major)),
      interestedDepartments: favoriteDepartments.map((d) => toJsonDepartment(d)),
    }
  }

  async updateInterestedDepartments(user: session_userprofile, departments: number[]): Promise<void> {
    return this.userRepositoryV2.updateInterestedDepartments(user, departments)
  }

  async getUserLikedReviews(user: session_userprofile, language: string = 'ko'): Promise<IReviewV2.Basic[]> {
    const DEFAULT_ORDER = ['-written_datetime', '-id']
    const MAX_LIMIT = 100
    const likedRaw = await this.reviewsRepository.getLikedReviews(user.id, DEFAULT_ORDER, 0, MAX_LIMIT)
    return likedRaw.map((review) => toJsonReviewV2(review, null, language))
  }

  // TODO; 공통화 필요
  private parseAcceptLanguage(acceptLanguage?: string): string {
    if (!acceptLanguage) {
      return 'kr'
    }

    // Simple check: if header contains 'en', return 'en', otherwise 'kr'
    return acceptLanguage.toLowerCase().includes('en') ? 'en' : 'kr'
  }
}
