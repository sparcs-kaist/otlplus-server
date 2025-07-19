export const REVIEW_MQ = Symbol('REVIEW_MQ')
export interface ReviewMQ {
  publishLectureScoreUpdate(lectureId: number): Promise<boolean>
  publishCourseScoreUpdate(courseId: number): Promise<boolean>
  publishProfessorScoreUpdate(professorId: number): Promise<boolean>
  publishReviewLikeUpdate(reviewId: number): Promise<boolean>
}
