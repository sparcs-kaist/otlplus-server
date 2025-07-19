import { AmqpConnection, RabbitPayload, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { Controller } from '@nestjs/common'
import settings, { QueueSymbols } from '@otl/rmq/settings'
import { CourseScoreUpdateMessage } from '@otl/server-consumer/messages/course'
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
export class DeadLetterController {
  constructor(
    private readonly appService: AppService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  /**
   * SCHOLAR_SYNC_DLQ 메시지 핸들러
   */
  @RabbitSubscribe({
    ...settings().getRabbitMQConfig().queueConfig[QueueSymbols.SCHOLAR_SYNC_DLQ],
  })
  async handleScholarSyncDLQ(@RabbitPayload() msg: any, amqpMsg: ConsumeMessage) {
    // 공통 재시도 핸들러에 실제 비즈니스 로직을 콜백으로 전달
    await this.handleWithRetry(msg, amqpMsg, async (request) => {
      if (request.type === EVENT_TYPE.LECTURE_TITLE) {
        if (!LectureCommonTitleUpdateMessage.isValid(request)) {
          throw new Error(`Invalid lecture title update message: ${JSON.stringify(request)}`)
        }
        return this.appService.updateLectureCommonTitle(request, amqpMsg)
      }
      // 이 큐에서 처리하지 않는 타입이면 true를 반환하여 ack 처리
      logger.warn(`[DLQ] Unhandled message type in SCHOLAR_SYNC_DLQ: ${request.type}`)
      return true
    })
  }

  /**
   * STATISTICS_DLQ 메시지 핸들러
   */
  @RabbitSubscribe({
    ...settings().getRabbitMQConfig().queueConfig[QueueSymbols.STATISTICS_DLQ],
  })
  async handleStatisticsDLQ(@RabbitPayload() msg: any, amqpMsg: ConsumeMessage) {
    // 공통 재시도 핸들러에 실제 비즈니스 로직을 콜백으로 전달
    await this.handleWithRetry(msg, amqpMsg, async (request) => {
      // 각 이벤트 타입에 맞는 핸들러를 찾아 실행
      switch (request.type) {
        case EVENT_TYPE.LECTURE_SCORE:
          if (!LectureScoreUpdateMessage.isValid(request)) throw new Error('Invalid Message')
          return this.appService.updateLectureScoreUpdateMessage(request, amqpMsg)

        case EVENT_TYPE.COURSE_SCORE:
          if (!CourseScoreUpdateMessage.isValid(request)) throw new Error('Invalid Message')
          return this.appService.updateCourseScoreUpdateMessage(request, amqpMsg)

        case EVENT_TYPE.PROFESSOR_SCORE:
          if (!ProfessorScoreUpdateMessage.isValid(request)) throw new Error('Invalid Message')
          return this.appService.updateProfessorScoreUpdateMessage(request, amqpMsg)

        case EVENT_TYPE.LECTURE_NUM_PEOPLE:
          if (!LectureNumPeopleUpdateMessage.isValid(request)) throw new Error('Invalid Message')
          return this.appService.updateLectureNumPeopleUpdateMessage(request, amqpMsg)

        case EVENT_TYPE.REVIEW_LIKE:
          if (!ReviewLikeUpdateMessage.isValid(request)) throw new Error('Invalid Message')
          return this.appService.updateReviewLikeUpdateMessage(request, amqpMsg)

        default:
          logger.warn(`[DLQ] Unhandled message type in STATISTICS_DLQ: ${request.type}`)
          // 처리할 수 없는 타입은 성공으로 간주하여 큐에서 제거
          return Promise.resolve(true)
      }
    })
  }

  // =================================================================================
  // 공통 로직 (Helper Method)
  // =================================================================================

  /**
   * DLQ 메시지 처리를 위한 공통 재시도 및 지연 발행 로직
   * @param msg 메시지 페이로드
   * @param amqpMsg 원본 AMQP 메시지
   * @param processMessage 실제 비즈니스 로직을 담은 콜백 함수. 성공 시 true, 재시도 필요 시 false 반환.
   */
  private async handleWithRetry(
    msg: any,
    amqpMsg: ConsumeMessage,
    processMessage: (request: Message) => Promise<boolean>,
  ) {
    const MAX_RETRIES = 3
    const RETRY_DELAY = 30000 // 30초

    try {
      const retryCount = amqpMsg.properties?.headers?.['x-retry-count'] ?? 0
      if (retryCount >= MAX_RETRIES) {
        logger.error(`[DLQ] Max retries reached. Discarding message: ${JSON.stringify(msg)}`)
        return // ack 하고 종료
      }

      // 1. 실제 비즈니스 로직 실행
      const request = plainToInstance(Message, msg)
      const isSuccess = await processMessage(request)

      if (isSuccess) {
        logger.info(`[DLQ] Successfully processed message: ${JSON.stringify(msg)}`)
        return // ack 하고 종료
      }

      // 2. 처리 실패 시, 지연을 주어 다시 발행
      const xDeath = amqpMsg.properties?.headers?.['x-death']?.[0]
      const originalExchange = xDeath?.exchange
      const originalRoutingKey = xDeath?.['routing-keys']?.[0]

      if (!originalExchange || !originalRoutingKey) {
        throw new Error('Cannot determine original exchange/routingKey from \'x-death\' header.')
      }

      logger.warn(`[DLQ] Failed to process. Retrying in ${RETRY_DELAY / 1000}s (Attempt: ${retryCount + 1})`)

      await this.amqpConnection.publish(originalExchange, originalRoutingKey, msg, {
        headers: {
          'x-delay': RETRY_DELAY,
          'x-retry-count': retryCount + 1,
        },
      })
    }
    catch (error: any) {
      logger.error(`[DLQ] Unhandled error processing message. Discarding: ${error.message}`, { msg })
      // 예측하지 못한 에러(유효성 검증 실패 등) 발생 시 재시도 없이 ack 하고 종료
    }
  }
}
