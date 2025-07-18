import { LectureBasic } from '@otl/server-nest/modules/lectures/domain/lecture'
import { ReviewBasic, ReviewWithLecture } from '@otl/server-nest/modules/reviews/domain/review'

export const REVIEW_REPOSITORY = Symbol('REVIEW_REPOSITORY')
export interface ServerConsumerReviewRepository {
  getRelatedReviewsByLectureId(lecture: LectureBasic, professorsId: number[]): Promise<ReviewWithLecture[]>

  getRelatedReviewsByCourseId(courseId: number): Promise<ReviewWithLecture[]>

  getRelatedReviewsByProfessorId(professorId: number): Promise<ReviewWithLecture[]>

  getReviewLikeCount(reviewId: number): Promise<number>

  updateReviewLikeCount(reviewId: number, likeCount: number): Promise<ReviewBasic>
}
