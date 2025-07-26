import { defaultNackErrorHandler, Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { Controller } from '@nestjs/common'
import settings, { QueueSymbols } from '@otl/rmq/settings'
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

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @RabbitSubscribe({
    ...settings().getRabbitMQConfig().queueConfig[QueueSymbols.SCHOLAR_SYNC],
    errorHandler: defaultNackErrorHandler,
  })
  async handleScholarMessage(msg: any, amqpMsg: ConsumeMessage) {
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

  @RabbitSubscribe({
    ...settings().getRabbitMQConfig().queueConfig[QueueSymbols.STATISTICS],
    errorHandler: defaultNackErrorHandler,
  })
  async handleStatisticsMessage(msg: any, amqpMsg: ConsumeMessage) {
    const request = plainToInstance(Message, msg)
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
