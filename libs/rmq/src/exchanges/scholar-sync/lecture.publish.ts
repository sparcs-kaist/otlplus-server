import { Injectable } from '@nestjs/common'
import { RabbitPublisherService } from '@otl/rmq/rabbitmq.publisher' // 👈 [1] 커스텀 Publisher 서비스 import
import settings, { ExchangeNames, QueueSymbols } from '@otl/rmq/settings'
import { ScholarMQ } from '@otl/scholar-sync/domain/out/ScholarMQ'
import { CourseRepresentativeLectureUpdateMessage } from '@otl/server-consumer/messages/course'
import { LectureCommonTitleUpdateMessage } from '@otl/server-consumer/messages/lecture'
import { EVENT_TYPE } from '@otl/server-consumer/messages/message'

@Injectable()
export class ScholarUpdatePublisher implements ScholarMQ {
  constructor(private readonly rabbitPublisherService: RabbitPublisherService) {}

  private getExchangeAndRouting(): { exchange: string, routingKey: string } {
    const config = settings().getRabbitMQConfig()
    const exchange = config.exchangeConfig.exchangeMap[ExchangeNames.SCHOLAR_SYNC]
    const routingKey = config.queueConfig[QueueSymbols.SCHOLAR_SYNC].routingKey as string
    return { exchange: exchange.name, routingKey }
  }

  async publishRepresentativeLectureUpdate(courseId: number, lectureId: number | null): Promise<boolean> {
    const { exchange, routingKey } = this.getExchangeAndRouting()
    const payload: CourseRepresentativeLectureUpdateMessage = {
      courseId,
      lectureId,
      type: EVENT_TYPE.COURSE_REPRESENTATIVE_LECTURE,
    }
    await this.rabbitPublisherService.publishToExchange(exchange, routingKey, payload)
    return true
  }

  async publishLectureTitleUpdate(lectureId: number): Promise<boolean> {
    const { exchange, routingKey } = this.getExchangeAndRouting()
    const payload: LectureCommonTitleUpdateMessage = {
      lectureId,
      type: EVENT_TYPE.LECTURE_TITLE,
    }
    await this.rabbitPublisherService.publishToExchange(exchange, routingKey, payload)
    return true
  }
}
