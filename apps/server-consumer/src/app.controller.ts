import { defaultNackErrorHandler, Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { Controller } from '@nestjs/common'
import settings, { QueueSymbols } from '@otl/rmq/settings'
import {
  LECTURE_EVENT_TYPE,
  LectureCommonTitleUpdateMessage,
  LectureScoreUpdateMessage,
  LectureUpdateMessage,
} from '@otl/server-consumer/messages/lecture'
import { ConsumeMessage } from 'amqplib'
import { plainToInstance } from 'class-transformer'

import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @RabbitSubscribe({
    ...settings().getRabbitMQConfig().queueConfig[QueueSymbols.SCHOLAR_SYNC],
    errorHandler: defaultNackErrorHandler,
  })
  handleLectureUpdate(msg: any, amqpMsg: ConsumeMessage) {
    const request = plainToInstance(LectureUpdateMessage, msg)
    if (request.type === LECTURE_EVENT_TYPE.TITLE) {
      if (!LectureCommonTitleUpdateMessage.isValid(request)) {
        throw new Error(`Invalid lecture title update message: ${JSON.stringify(request)}`)
      }
      const result = this.appService.updateLectureCommonTitle(request, amqpMsg)
      if (!result) {
        console.error(`Failed to process lecture common title update message: ${JSON.stringify(request)}`)
        return new Nack(false)
      }
      return true
    }
    if (request.type === LECTURE_EVENT_TYPE.SCORE) {
      if (!LectureScoreUpdateMessage.isValid(request)) {
        throw new Error(`Invalid lecture score update message: ${JSON.stringify(request)}`)
      }
      const result = this.appService.updateLectureScoreUpdateMessage(request, amqpMsg)
      if (!result) {
        console.error(`Failed to process lecture score update message: ${JSON.stringify(request)}`)
        return new Nack(false)
      }
      return true
    }
    return true
  }
}
