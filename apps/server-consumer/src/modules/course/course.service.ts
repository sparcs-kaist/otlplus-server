import { Inject, Injectable } from '@nestjs/common'
import { LectureService } from '@otl/server-consumer/modules/lecture/lecture.service'
import { COURSE_REPOSITORY, ServerConsumerCourseRepository } from '@otl/server-consumer/out/course.repository'
import { LECTURE_REPOSITORY, ServerConsumerLectureRepository } from '@otl/server-consumer/out/lecture.repository'
import { REVIEW_REPOSITORY, ServerConsumerReviewRepository } from '@otl/server-consumer/out/review.repository'

@Injectable()
export class CourseService {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: ServerConsumerReviewRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ServerConsumerCourseRepository,
    @Inject(LECTURE_REPOSITORY)
    private readonly lectureRepository: ServerConsumerLectureRepository,
    private readonly lectureService: LectureService,
  ) {}

  async updateScore(courseId: number) {
    const reviewsWithLecture = await this.reviewRepository.getRelatedReviewsByCourseId(courseId)
    const grades = await this.lectureService.lectureCalcAverage(reviewsWithLecture)
    const course = this.courseRepository.updateCourseScore(courseId, grades)
    if (!course) {
      throw new Error(`Failed to update course score for courseId: ${courseId}`)
    }
    return course
  }

  async updateRepresentativeLecture(courseId: number, lectureId: number | null) {
    const result = await this.courseRepository.updateCourseRepresentativeLecture(courseId, lectureId)
    if (!result) {
      throw new Error(
        `Failed to update course representative lecture for courseId: ${courseId}, lectureId: ${lectureId}`,
      )
    }
    return result
  }
}
