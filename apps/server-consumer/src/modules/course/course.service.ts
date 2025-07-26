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
    return true
  }

  async updateRepresentativeLecture(courseId: number, lectureId: number) {
    const course = await this.courseRepository.getCourseBasicById(courseId)
    if (!course) {
      throw new Error(`Course not found for courseId: ${courseId}`)
    }
    const lecture = await this.lectureRepository.getLectureById(lectureId)
    if (!lecture) {
      throw new Error(`Lecture not found for lectureId: ${lectureId}`)
    }
    const result = this.courseRepository.updateCourseRepresentativeLecture(course.id, lecture.id)
    if (!result) {
      return false
    }
    return true
  }
}
