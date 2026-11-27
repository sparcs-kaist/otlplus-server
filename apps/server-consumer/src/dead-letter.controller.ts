import { Injectable } from '@nestjs/common'
import { RabbitConsumer } from '@otl/rmq/decorator/rabbit-consumer.decorator'
import { QueueSymbols } from '@otl/rmq/settings'
import * as Sentry from '@sentry/node'
import { ConsumeMessage } from 'amqplib'

import logger from '@otl/common/logger/logger'

@Injectable()
export class DeadLetterController {
  private readonly logger = logger

  constructor() {}

  /**
   * SCHOLAR_SYNC_DLQ 메시지 핸들러
   */
  @RabbitConsumer(QueueSymbols.SCHOLAR_SYNC_DLQ)
  async handleScholarSyncDLQ(amqpMsg: ConsumeMessage) {
    logger.info(`[DLQ] Received message in SCHOLAR_DLQ: ${JSON.stringify(amqpMsg)}`)
    const content = JSON.parse(amqpMsg.content.toString())
    const { headers } = amqpMsg.properties
    const deathInfo = headers?.['x-death']?.[0] // 👈 실패 정보가 담긴 헤더
    // 공통 재시도 핸들러에 실제 비즈니스 로직을 콜백으로 전달
    const errorMessage = `
    🚨 DLQ Message Received!
    - - - - - - - - - - - - - - - - - - - - - - - -
    - Exchange: ${deathInfo?.exchange}
    - Queue: ${deathInfo?.queue}
    - RoutingKey: ${deathInfo?.['routing-keys']?.[0]}
    - Reason: ${deathInfo?.reason}
    - Retry Count: ${deathInfo?.count}
    - - - - - - - - - - - - - - - - - - - - - - - -
    - Message Body: ${JSON.stringify(content)}
    - - - - - - - - - - - - - - - - - - - - - - - -
    `
    await this.reportToSentry(errorMessage, deathInfo, content, headers)
    logger.error(errorMessage)
  }

  /**
   * STATISTICS_DLQ 메시지 핸들러
   */
  // @RabbitSubscribe({
  //   ...settings().getRabbitMQConfig().queueConfig[QueueSymbols.STATISTICS_DLQ],
  // })
  @RabbitConsumer(QueueSymbols.STATISTICS_DLQ)
  async handleStatisticsDLQ(amqpMsg: ConsumeMessage) {
    logger.info(`[DLQ] Received message in STATISTICS_DLQ: ${JSON.stringify(amqpMsg)}`)
    const content = JSON.parse(amqpMsg.content.toString())
    const { headers } = amqpMsg.properties
    const deathInfo = headers?.['x-death']?.[0] // 👈 실패 정보가 담긴 헤더
    // 공통 재시도 핸들러에 실제 비즈니스 로직을 콜백으로 전달
    const errorMessage = `
    🚨 DLQ Message Received!
    - - - - - - - - - - - - - - - - - - - - - - - -
    - Exchange: ${deathInfo?.exchange}
    - Queue: ${deathInfo?.queue}
    - RoutingKey: ${deathInfo?.['routing-keys']?.[0]}
    - Reason: ${deathInfo?.reason}
    - Retry Count: ${deathInfo?.count}
    - - - - - - - - - - - - - - - - - - - - - - - -
    - Message Body: ${JSON.stringify(content)}
    - - - - - - - - - - - - - - - - - - - - - - - -
    `
    await this.reportToSentry(errorMessage, deathInfo, content, headers)
    logger.error(errorMessage)
  }

  private async reportToSentry(errorMessage: string, deathInfo: { queue?: string, reason?: string, exchange?: string } | undefined, content: unknown, headers: unknown) {
    const error = new Error(errorMessage)
    // 👇 Sentry 리포팅 로직
    Sentry.withScope((scope) => {
      // Sentry에서 에러를 그룹핑할 때 사용할 지문(fingerprint)
      scope.setFingerprint(['rabbitmq-dlq', deathInfo?.queue || 'unknown-queue', deathInfo?.reason || 'unknown-reason'])

      // 디버깅에 유용한 태그 추가
      scope.setTag('queue', deathInfo?.queue)
      scope.setTag('exchange', deathInfo?.exchange)
      scope.setTag('reason', deathInfo?.reason)

      // 상세 정보를 extra context에 추가
      scope.setExtra('Message Body', content)
      scope.setExtra('Message Headers', headers)

      // Sentry에 에러 리포트
      Sentry.captureException(error)
    })
  }
}
