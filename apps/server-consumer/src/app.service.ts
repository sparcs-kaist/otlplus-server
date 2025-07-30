import { Injectable } from '@nestjs/common'
import { CourseRepresentativeLectureUpdateMessage, CourseUpdateMessage } from '@otl/server-consumer/messages/course'
import {
  LectureCommonTitleUpdateMessage,
  LectureNumPeopleUpdateMessage,
  LectureScoreUpdateMessage,
} from '@otl/server-consumer/messages/lecture'
import { ProfessorUpdateMessage } from '@otl/server-consumer/messages/professor'
import { ReviewLikeUpdateMessage } from '@otl/server-consumer/messages/review'
import { CourseService } from '@otl/server-consumer/modules/course/course.service'
import { LectureService } from '@otl/server-consumer/modules/lecture/lecture.service'
import { ProfessorService } from '@otl/server-consumer/modules/professor/professor.service'
import { ReviewService } from '@otl/server-consumer/modules/review/review.service'
import { ConsumeMessage } from 'amqplib'

@Injectable()
export class AppService {
  constructor(
    private readonly lectureService: LectureService,
    private readonly courseService: CourseService,
    private readonly professorService: ProfessorService,
    private readonly reviewService: ReviewService,
  ) {}

  async updateLectureCommonTitle(msg: LectureCommonTitleUpdateMessage, _amqpMsg: ConsumeMessage): Promise<boolean> {
    const { lectureId, courseId } = msg
    return await this.lectureService.updateClassTitle(lectureId, courseId)
  }

  async updateLectureScoreUpdateMessage(msg: LectureScoreUpdateMessage, _amqpMsg: ConsumeMessage) {
    const { lectureId } = msg
    return await this.lectureService.updateScore(lectureId)
  }

  async updateCourseScoreUpdateMessage(request: CourseUpdateMessage, _amqpMsg: ConsumeMessage) {
    const { courseId } = request
    return await this.courseService.updateScore(courseId)
  }

  async updateProfessorScoreUpdateMessage(request: ProfessorUpdateMessage, _amqpMsg: ConsumeMessage) {
    const { professorId } = request
    return await this.professorService.updateScore(professorId)
  }

  async updateLectureNumPeopleUpdateMessage(request: LectureNumPeopleUpdateMessage, _amqpMsg: ConsumeMessage) {
    const { lectureId } = request
    return await this.lectureService.updateNumPeople(lectureId)
  }

  async updateReviewLikeUpdateMessage(request: ReviewLikeUpdateMessage, _amqpMsg: ConsumeMessage) {
    const { reviewId } = request
    return await this.reviewService.updateReviewLike(reviewId)
  }

  async updateCourseRepresentativeLecture(request: CourseRepresentativeLectureUpdateMessage, _amqpMsg: ConsumeMessage) {
    const { courseId, lectureId } = request
    return await this.courseService.updateRepresentativeLecture(courseId, lectureId)
  }
}
