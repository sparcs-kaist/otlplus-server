import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Transactional } from '@nestjs-cls/transactional'
import { Language } from '@otl/server-nest/common/decorators/get-language.decorator'
import { ICourseV2, IUserV2 } from '@otl/server-nest/common/interfaces/v2'
import { IReviewV2 } from '@otl/server-nest/common/interfaces/v2/IReviewV2'
import { toJsonReviewV2 } from '@otl/server-nest/common/serializer/v2/review.serializer'
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

  async getUserLectures(user: session_userprofile, language: Language): Promise<IUserV2.LecturesResponse> {
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

  async getUserWrittenReviews(user: session_userprofile, language: Language): Promise<IUserV2.WrittenReviewsResponse> {
    const writtenRaw = await this.reviewsRepository.findReviewByUser(user)
    return { reviews: writtenRaw.map((review) => toJsonReviewV2(review, null, language)) }
  }

  async getWishlist(
    user: session_userprofile,
    query: IUserV2.WishlistQueryDto,
    language: Language,
  ): Promise<IUserV2.WishlistResponse> {
    // Fetch wishlist and taken lectures in parallel
    const wishlist = await this.wishlistRepository.getOrCreateWishlistBySemester(
      user.id,
      Number(query.year),
      Number(query.semester),
    )

    const takenLectures = await this.lectureRepository.getTakenLectures(user)

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
  async updateWishlist(user: session_userprofile, body: IUserV2.UpdateWishlistDto): Promise<void> {
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

  async getUnreviewedRandomCourse(
    user: session_userprofile,
    language: Language,
  ): Promise<ICourseV2.WritableReview | null> {
    const [writtenReviews, reviewWritableLectures] = await Promise.all([
      this.reviewsRepository.findReviewByUser(user),
      this.lectureRepository.findReviewWritableLectures(user),
    ])

    const reviewedLectureIds = new Set(writtenReviews.map((review) => review.lecture_id))
    const unreviewedLectures = reviewWritableLectures.filter((lecture) => !reviewedLectureIds.has(lecture.id))

    if (unreviewedLectures.length === 0) {
      return null
    }
    const randomLecture = unreviewedLectures[Math.floor(Math.random() * unreviewedLectures.length)]
    return {
      lectureId: randomLecture.id,
      name: language === 'en' ? randomLecture.title_en : randomLecture.title,
      totalRemainingCount: unreviewedLectures.length,
    }
  }

  async getUserInfo(user: session_userprofile): Promise<IUserV2.Info | null> {
    const { id } = user
    const name = `${user.first_name} ${user.last_name}`
    const mail = user.email || ''
    const studentNumber = parseInt(user.student_id)
    const degree = (user as any).degree || null
    const [favoriteDepartments, majors] = await Promise.all([
      this.departmentRepository.getFavoriteDepartments(user),
      this.departmentRepository.getMajors(user),
    ])

    return {
      id,
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
    return likedRaw.map((review) => toJsonReviewV2(review, user, language))
  }
}
