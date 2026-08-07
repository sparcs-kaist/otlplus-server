import { Injectable } from '@nestjs/common'
import { RabbitPublisherService } from '@otl/rmq/rabbitmq.publisher'
import settings, { ExchangeNames, QueueSymbols } from '@otl/rmq/settings'
import { SyncServerStatisticsMQ } from '@otl/scholar-sync/domain/out/StatisticsMQ'
import { CourseScoreUpdateMessage } from '@otl/server-consumer/messages/course'
import { LectureNumPeopleUpdateMessage, LectureScoreUpdateMessage } from '@otl/server-consumer/messages/lecture'
import { EVENT_TYPE } from '@otl/server-consumer/messages/message'
import { ProfessorScoreUpdateMessage } from '@otl/server-consumer/messages/professor'
import { ReviewMQ } from '@otl/server-nest/modules/reviews/domain/out/ReviewMQ'
import { TimetableMQ } from '@otl/server-nest/modules/timetables/domain/out/TimetableMQ'

@Injectable()
export class StatisticsUpdatePublisher implements SyncServerStatisticsMQ, TimetableMQ, ReviewMQ {
  constructor(private readonly rabbitPublisherService: RabbitPublisherService) {}

  private getExchangeAndRouting(): { exchange: string, routingKey: string } {
    const config = settings().getRabbitMQConfig()
    const exchange = config.exchangeConfig.exchangeMap[ExchangeNames.STATISTICS]
    const routingKey = config.queueConfig[QueueSymbols.STATISTICS].routingKey as string
    return { exchange: exchange.name, routingKey }
  }

  async publishLectureScoreUpdate(lectureId: number): Promise<boolean> {
    const { exchange, routingKey } = this.getExchangeAndRouting()
    const payload: LectureScoreUpdateMessage = {
      lectureId,
      type: EVENT_TYPE.LECTURE_SCORE,
    }
    await this.rabbitPublisherService.publishToExchange(exchange, routingKey, payload)
    return true
  }

  async publishCourseScoreUpdate(courseId: number): Promise<boolean> {
    const { exchange, routingKey } = this.getExchangeAndRouting()
    const payload: CourseScoreUpdateMessage = {
      courseId,
      type: EVENT_TYPE.COURSE_SCORE,
    }
    await this.rabbitPublisherService.publishToExchange(exchange, routingKey, payload)
    return true
  }

  async publishLectureNumUpdate(lectureId: number): Promise<boolean> {
    const { exchange, routingKey } = this.getExchangeAndRouting()
    const payload: LectureNumPeopleUpdateMessage = {
      lectureId,
      type: EVENT_TYPE.LECTURE_NUM_PEOPLE,
    }
    await this.rabbitPublisherService.publishToExchange(exchange, routingKey, payload)
    return true
  }

  async publishProfessorScoreUpdate(professorId: number): Promise<boolean> {
    const { exchange, routingKey } = this.getExchangeAndRouting()
    const payload: ProfessorScoreUpdateMessage = {
      professorId,
      type: EVENT_TYPE.PROFESSOR_SCORE,
    }
    await this.rabbitPublisherService.publishToExchange(exchange, routingKey, payload)
    return true
  }

  async publishReviewLikeUpdate(reviewId: number): Promise<boolean> {
    const { exchange, routingKey } = this.getExchangeAndRouting()
    const payload = {
      reviewId,
      type: EVENT_TYPE.REVIEW_LIKE,
    }
    await this.rabbitPublisherService.publishToExchange(exchange, routingKey, payload)
    return true
  }
}
