import { Nack } from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import { RabbitConsumer } from '@otl/rmq/decorator/rabbit-consumer.decorator'
import { QueueSymbols } from '@otl/rmq/settings'
import {
  CourseRepresentativeLectureUpdateMessage,
  CourseScoreUpdateMessage,
} from '@otl/server-consumer/messages/course'
import {
  LectureCommonTitleUpdateMessage,
  LectureNumPeopleUpdateMessage,
  LectureScoreUpdateMessage,
} from '@otl/server-consumer/messages/lecture'
import { EVENT_TYPE, Message } from '@otl/server-consumer/messages/message'
import { ProfessorScoreUpdateMessage } from '@otl/server-consumer/messages/professor'
import { ReviewLikeUpdateMessage } from '@otl/server-consumer/messages/review'
import { ConsumeMessage } from 'amqplib'
import { plainToInstance } from 'class-transformer'

import logger from '@otl/common/logger/logger'

import { AppService } from './app.service'

@Injectable()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @RabbitConsumer(QueueSymbols.SCHOLAR_SYNC)
  async handleScholarMessage(amqpMsg: ConsumeMessage) {
    const msg = JSON.parse(amqpMsg.content.toString())
    const request = plainToInstance(Message, msg)
    if (request.type === EVENT_TYPE.LECTURE_TITLE) {
      if (!LectureCommonTitleUpdateMessage.isValid(request)) {
        throw new Error(`Invalid lecture title update message: ${JSON.stringify(request)}`)
      }
      const result = await this.appService.updateLectureCommonTitle(request, amqpMsg)
      if (!result) {
        logger.error(`Failed to process lecture common title update message: ${JSON.stringify(request)}`)
        return new Nack(false)
      }
      return true
    }
    if (request.type === EVENT_TYPE.COURSE_REPRESENTATIVE_LECTURE) {
      if (!CourseRepresentativeLectureUpdateMessage.isValid(request)) {
        throw new Error(`Invalid course representative lecture update message: ${JSON.stringify(request)}`)
      }
      const result = await this.appService.updateCourseRepresentativeLecture(request, amqpMsg)
      if (!result) {
        logger.error(`Failed to process course representative lecture update message: ${JSON.stringify(request)}`)
        return new Nack(false)
      }
    }
    return true
  }

  @RabbitConsumer(QueueSymbols.STATISTICS)
  async handleStatisticsMessage(amqpMsg: ConsumeMessage) {
    const msg = JSON.parse(amqpMsg.content.toString())
    const request = plainToInstance(Message, msg)
    console.log(msg)
    if (request.type === EVENT_TYPE.LECTURE_SCORE) {
      if (!LectureScoreUpdateMessage.isValid(request)) {
        throw new Error(`Invalid lecture score update message: ${JSON.stringify(request)}`)
      }
      const result = await this.appService.updateLectureScoreUpdateMessage(request, amqpMsg)
      if (!result) {
        logger.error(`Failed to process lecture score update message: ${JSON.stringify(request)}`)
        return new Nack(false)
      }
      return true
    }
    if (request.type === EVENT_TYPE.COURSE_SCORE) {
      if (!CourseScoreUpdateMessage.isValid(request)) {
        throw new Error(`Invalid course score update message: ${JSON.stringify(request)}`)
      }
      const result = await this.appService.updateCourseScoreUpdateMessage(request, amqpMsg)
      if (!result) {
        logger.error(`Failed to process course score update message: ${JSON.stringify(request)}`)
        return new Nack(false)
      }
    }
    if (request.type === EVENT_TYPE.PROFESSOR_SCORE) {
      if (!ProfessorScoreUpdateMessage.isValid(request)) {
        throw new Error(`Invalid professor score update message: ${JSON.stringify(request)}`)
      }
      if (!(await this.appService.updateProfessorScoreUpdateMessage(request, amqpMsg))) {
        logger.error(`Failed to process professor score update message: ${JSON.stringify(request)}`)
        return new Nack(false)
      }
    }
    if (request.type === EVENT_TYPE.LECTURE_NUM_PEOPLE) {
      if (!LectureNumPeopleUpdateMessage.isValid(request)) {
        throw new Error(`Invalid lecture num people update message: ${JSON.stringify(request)}`)
      }
      const result = await this.appService.updateLectureNumPeopleUpdateMessage(request, amqpMsg)
      if (!result) {
        logger.error(`Failed to process lecture num people update message: ${JSON.stringify(request)}`)
        return new Nack(false)
      }
    }
    if (request.type === EVENT_TYPE.REVIEW_LIKE) {
      if (!ReviewLikeUpdateMessage.isValid(request)) {
        throw new Error(`Invalid review like update message: ${JSON.stringify(request)}`)
      }
      const result = await this.appService.updateReviewLikeUpdateMessage(request, amqpMsg)
      if (!result) {
        logger.error(`Failed to process review like update message: ${JSON.stringify(request)}`)
        return new Nack(false)
      }
    }
    return true
  }
}
