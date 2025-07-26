import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import settings, { ExchangeNames, QueueSymbols } from '@otl/rmq/settings'
import { ScholarMQ } from '@otl/scholar-sync/domain/out/ScholarMQ'
import { CourseRepresentativeLectureUpdateMessage } from '@otl/server-consumer/messages/course'
import { LectureCommonTitleUpdateMessage } from '@otl/server-consumer/messages/lecture'
import { EVENT_TYPE } from '@otl/server-consumer/messages/message'

@Injectable()
export class ScholarUpdatePublisher implements ScholarMQ {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  publishRepresentativeLectureUpdate(courseId: number, lectureId: number): Promise<boolean> {
    const exchange = settings().getRabbitMQConfig().exchangeConfig.exchangeMap[ExchangeNames.SCHOLAR_SYNC]
    const routingKey = settings().getRabbitMQConfig().queueConfig[QueueSymbols.SCHOLAR_SYNC].routingKey as string
    const lectureUpdateMessage: CourseRepresentativeLectureUpdateMessage = {
      courseId,
      lectureId,
      type: EVENT_TYPE.COURSE_REPRESENTATIVE_LECTURE,
    }
    return this.amqpConnection.publish(exchange.name, routingKey, lectureUpdateMessage)
  }

  async publishLectureTitleUpdate(lectureId: number): Promise<boolean> {
    const exchange = settings().getRabbitMQConfig().exchangeConfig.exchangeMap[ExchangeNames.SCHOLAR_SYNC]
    const routingKey = settings().getRabbitMQConfig().queueConfig[QueueSymbols.SCHOLAR_SYNC].routingKey as string
    const lectureUpdateMessage: LectureCommonTitleUpdateMessage = {
      lectureId,
      type: EVENT_TYPE.LECTURE_TITLE,
    }
    return await this.amqpConnection.publish(exchange.name, routingKey, lectureUpdateMessage)
  }
}
