import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Transactional } from '@nestjs-cls/transactional'
import { IUserV2 } from '@otl/server-nest/common/interfaces/v2'
import { toJsonUserLecturesV2, toJsonWishlistV2 } from '@otl/server-nest/common/serializer/v2/user.serializer'
import { session_userprofile } from '@prisma/client'

import {
  CourseRepository, LectureRepository, ReviewsRepository, WishlistRepository,
} from '@otl/prisma-client'
import { mapCourse } from '@otl/prisma-client/common/mapper/course'

@Injectable()
export class UserServiceV2 {
  constructor(
    private readonly lectureRepository: LectureRepository,
    private readonly reviewsRepository: ReviewsRepository,
    private readonly wishlistRepository: WishlistRepository,
    private readonly courseRepository: CourseRepository,
  ) {}

  async getUserLectures(user: session_userprofile, acceptLanguage?: string): Promise<IUserV2.LecturesResponse> {
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

  async getWishlist(user: session_userprofile, acceptLanguage?: string): Promise<IUserV2.WishlistResponse> {
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

  // TODO; 공통화 필요
  private parseAcceptLanguage(acceptLanguage?: string): string {
    if (!acceptLanguage) {
      return 'kr'
    }

    // Simple check: if header contains 'en', return 'en', otherwise 'kr'
    return acceptLanguage.toLowerCase().includes('en') ? 'en' : 'kr'
  }
}
