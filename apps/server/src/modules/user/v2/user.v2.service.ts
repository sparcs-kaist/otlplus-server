import { Injectable } from '@nestjs/common'
import { IReviewV2 } from '@otl/server-nest/common/interfaces/v2/IReviewV2'
import { toJsonReviewV2 } from '@otl/server-nest/common/serializer/v2/review.v2.serializer'
import { session_userprofile } from '@prisma/client'

import { ReviewsRepository } from '@otl/prisma-client/repositories'

@Injectable()
export class UserV2Service {
  constructor(private readonly reviewsRepository: ReviewsRepository) {}

  async getUserLikedReviews(user: session_userprofile, language: string = 'ko'): Promise<IReviewV2.Basic[]> {
    const DEFAULT_ORDER = ['-written_datetime', '-id']
    const MAX_LIMIT = 100
    const likedRaw = await this.reviewsRepository.getLikedReviews(user.id, DEFAULT_ORDER, 0, MAX_LIMIT)
    return likedRaw.map((review) => toJsonReviewV2(review, null, language))
  }
}
