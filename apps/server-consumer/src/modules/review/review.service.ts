import { Inject, Injectable } from '@nestjs/common'
import { REVIEW_REPOSITORY, ServerConsumerReviewRepository } from '@otl/server-consumer/out/review.repository'

@Injectable()
export class ReviewService {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: ServerConsumerReviewRepository,
  ) {}

  async updateReviewLike(reviewId: number) {
    const likeCount = await this.reviewRepository.getReviewLikeCount(reviewId)
    if (likeCount === null) {
      console.error(`Failed to get like count for reviewId: ${reviewId}`)
      throw new Error(`Review with ID ${reviewId} not found or has no likes.`)
    }
    const review = await this.reviewRepository.updateReviewLikeCount(reviewId, likeCount)
    if (!review) {
      console.error(`Failed to update like count for reviewId: ${reviewId}`)
      throw new Error(`Failed to update like count for reviewId: ${reviewId}`)
    }
    return review
  }
}
