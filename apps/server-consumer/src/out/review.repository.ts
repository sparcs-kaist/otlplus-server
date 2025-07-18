import { LectureBasic } from '@otl/server-nest/modules/lectures/domain/lecture'
import { ReviewWithLecture } from '@otl/server-nest/modules/reviews/domain/review'

export const REVIEW_REPOSITORY = Symbol('REVIEW_REPOSITORY')
export interface ServerConsumerReviewRepository {
  getRelatedReviewsByLectureId(lecture: LectureBasic, professorsId: number[]): Promise<ReviewWithLecture[]>
}
