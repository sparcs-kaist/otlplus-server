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
    const { lectureId } = msg
    try {
      return await this.lectureService.updateClassTitle(lectureId)
    }
    catch (e) {
      console.error(`Failed to update lecture common title for lectureId: ${lectureId}`, e)
      return false
    }
  }

  async updateLectureScoreUpdateMessage(msg: LectureScoreUpdateMessage, _amqpMsg: ConsumeMessage): Promise<boolean> {
    const { lectureId } = msg
    try {
      return await this.lectureService.updateScore(lectureId)
    }
    catch (e) {
      console.error(`Failed to update lecture score for lectureId: ${lectureId}`, e)
      return false
    }
  }

  async updateCourseScoreUpdateMessage(request: CourseUpdateMessage, _amqpMsg: ConsumeMessage): Promise<boolean> {
    const { courseId } = request
    try {
      return await this.courseService.updateScore(courseId)
    }
    catch (e) {
      console.error(`Failed to update course score for courseId: ${courseId}`, e)
      return false
    }
  }

  async updateProfessorScoreUpdateMessage(request: ProfessorUpdateMessage, _amqpMsg: ConsumeMessage): Promise<boolean> {
    const { professorId } = request
    try {
      return await this.professorService.updateScore(professorId)
    }
    catch (e) {
      console.error(`Failed to update professor score for professorId: ${professorId}`, e)
      return false
    }
  }

  async updateLectureNumPeopleUpdateMessage(request: LectureNumPeopleUpdateMessage, _amqpMsg: ConsumeMessage) {
    const { lectureId } = request
    try {
      const result = await this.lectureService.updateNumPeople(lectureId)
      if (!result) {
        console.error(`Failed to update lecture num people for lectureId: ${lectureId}`)
        return false
      }
      return true
    }
    catch (e) {
      console.error(`Failed to update lecture num people for lectureId: ${lectureId}`, e)
      return false
    }
  }

  async updateReviewLikeUpdateMessage(request: ReviewLikeUpdateMessage, _amqpMsg: ConsumeMessage) {
    const { reviewId } = request
    try {
      return await this.reviewService.updateReviewLike(reviewId)
    }
    catch (e) {
      console.error(`Failed to update review like for reviewId: ${reviewId}`, e)
      return false
    }
  }

  async updateCourseRepresentativeLecture(
    request: CourseRepresentativeLectureUpdateMessage,
    _amqpMsg: ConsumeMessage,
  ): Promise<boolean> {
    const { courseId, lectureId } = request
    try {
      return await this.courseService.updateRepresentativeLecture(courseId, lectureId)
    }
    catch (e) {
      console.error(
        `Failed to update course representative lecture for courseId: ${courseId}, lectureId: ${lectureId}`,
        e,
      )
      return false
    }
  }
}
