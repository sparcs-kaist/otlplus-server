import { Injectable } from '@nestjs/common'
import { IUserV2 } from '@otl/server-nest/common/interfaces/v2'
import { toJsonUserLecturesV2 } from '@otl/server-nest/common/serializer/v2/user.serializer'
import { session_userprofile } from '@prisma/client'

import { LectureRepository, ReviewsRepository } from '@otl/prisma-client'

@Injectable()
export class UserServiceV2 {
  constructor(
    private readonly lectureRepository: LectureRepository,
    private readonly reviewsRepository: ReviewsRepository,
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

  // TODO; 공통화 필요
  private parseAcceptLanguage(acceptLanguage?: string): string {
    if (!acceptLanguage) {
      return 'kr'
    }

    // Simple check: if header contains 'en', return 'en', otherwise 'kr'
    return acceptLanguage.toLowerCase().includes('en') ? 'en' : 'kr'
  }
}
