import { Injectable } from '@nestjs/common'
import { RabbitPublisherService } from '@otl/rmq/rabbitmq.publisher'
import settings, { ExchangeNames, QueueSymbols } from '@otl/rmq/settings'
import { IScholar } from '@otl/scholar-sync/clients/scholar/IScholar'
import { ScholarMQ } from '@otl/scholar-sync/domain/out/ScholarMQ'
import { CourseRepresentativeLectureUpdateMessage } from '@otl/server-consumer/messages/course'
import { LectureCommonTitleUpdateMessage } from '@otl/server-consumer/messages/lecture'
import { EVENT_TYPE } from '@otl/server-consumer/messages/message'
import {
  IndividualSyncUpdateRequestMessage,
  IndividualSyncUpdateStartMessage,
} from '@otl/server-consumer/messages/sync'
import { TakenLectureMQ } from '@otl/server-nest/modules/sync/domain/sync.mq'

@Injectable()
export class ScholarUpdatePublisher implements ScholarMQ, TakenLectureMQ {
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

  async publishLectureTitleUpdate(lectureId: number, courseId: number): Promise<boolean> {
    const { exchange, routingKey } = this.getExchangeAndRouting()
    const payload: LectureCommonTitleUpdateMessage = {
      lectureId,
      courseId,
      type: EVENT_TYPE.LECTURE_TITLE,
    }
    await this.rabbitPublisherService.publishToExchange(exchange, routingKey, payload)
    return true
  }

  async publishIndividualTakenLectureUpdate(
    year: number,
    semester: number,
    studentNo: number,
    userId: number,
    requestId: string,
    lectureData: IScholar.ScholarDBBody,
    classtimeData: IScholar.ClasstimeBody,
    examTimeData: IScholar.ExamtimeBody,
    takenLectureData: IScholar.TakenLectureBody,
  ): Promise<boolean> {
    const { exchange, routingKey } = this.getExchangeAndRouting()
    const payload: IndividualSyncUpdateStartMessage = {
      type: EVENT_TYPE.INDIVIDUAL_SYNC_UPDATE_START,
      year,
      semester,
      studentId: studentNo,
      userId,
      requestId,
      lectureData,
      classtimeData,
      examTimeData,
      takenLectureData,
    }
    await this.rabbitPublisherService.publishToExchange(exchange, routingKey, payload)
    return true
  }

  async publishTakenLectureSyncRequest(
    requestId: string,
    userId: number,
    studentId: number,
    year: number,
    semester: number,
  ): Promise<boolean> {
    const { exchange, routingKey } = this.getExchangeAndRouting()
    const payload: IndividualSyncUpdateRequestMessage = {
      type: EVENT_TYPE.INDIVIDUAL_SYNC_UPDATE_REQUEST,
      requestId,
      userId,
      studentId,
      year,
      semester,
    }
    await this.rabbitPublisherService.publishToExchange(exchange, routingKey, payload)
    return true
  }
}
