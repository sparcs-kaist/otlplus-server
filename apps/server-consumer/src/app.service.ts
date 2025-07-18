import { Injectable } from '@nestjs/common'
import { LectureService } from '@otl/server-consumer/lecture.service'
import { LectureCommonTitleUpdateMessage, LectureScoreUpdateMessage } from '@otl/server-consumer/messages/lecture'
import { ConsumeMessage } from 'amqplib'

@Injectable()
export class AppService {
  constructor(private readonly lectureService: LectureService) {}

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
      return await this.lectureService.updateClassTitle(lectureId)
    }
    catch (e) {
      console.error(`Failed to update lecture score for lectureId: ${lectureId}`, e)
      return false
    }
  }
}
