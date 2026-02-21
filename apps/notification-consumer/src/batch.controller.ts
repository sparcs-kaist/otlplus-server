import {
  defaultNackErrorHandler,
  MessageHandlerErrorBehavior,
  RabbitPayload,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq'
import { ackErrorHandler } from '@golevelup/nestjs-rabbitmq/lib/amqp/errorBehaviors'
import { Controller } from '@nestjs/common'
import { BatchFcmService } from '@otl/notification-consumer/batch-fcm.service'
import settings, { QueueSymbols } from '@otl/rmq/settings'
import { BatchNotificationMessage } from '@otl/server-nest/modules/notification/domain/push-notification.message'

import logger from '@otl/common/logger/logger'

@Controller()
export class BatchController {
  constructor(private readonly batchFcmService: BatchFcmService) {}

  @RabbitSubscribe({
    ...settings().getRabbitMQConfig().queueConfig[QueueSymbols.NOTI_BATCH_URGENT],
    errorHandler: defaultNackErrorHandler,
  })
  async handleUrgentBatch(@RabbitPayload() msg: BatchNotificationMessage) {
    logger.info(`[BatchController] Received URGENT batch: ${msg.batchId}`)
    return this.batchFcmService.processBatch(msg)
  }

  @RabbitSubscribe({
    ...settings().getRabbitMQConfig().queueConfig[QueueSymbols.NOTI_BATCH_NORMAL],
    errorHandler: defaultNackErrorHandler,
  })
  async handleNormalBatch(@RabbitPayload() msg: BatchNotificationMessage) {
    logger.info(`[BatchController] Received NORMAL batch: ${msg.batchId}`)
    return this.batchFcmService.processBatch(msg)
  }

  @RabbitSubscribe({
    ...settings().getRabbitMQConfig().queueConfig[QueueSymbols.NOTI_BATCH_BULK],
    errorHandler: defaultNackErrorHandler,
  })
  async handleBulkBatch(@RabbitPayload() msg: BatchNotificationMessage) {
    logger.info(`[BatchController] Received BULK batch: ${msg.batchId}`)
    return this.batchFcmService.processBatch(msg)
  }

  // --- DLQ Handlers ---

  @RabbitSubscribe({
    ...settings().getRabbitMQConfig().queueConfig[QueueSymbols.NOTI_BATCH_URGENT_DLQ],
    errorBehavior: MessageHandlerErrorBehavior.ACK,
    errorHandler: ackErrorHandler,
  })
  handleUrgentBatchDLQ(@RabbitPayload() msg: BatchNotificationMessage) {
    logger.error(`[BatchController DLQ] URGENT batch failed: ${JSON.stringify(msg)}`)
  }

  @RabbitSubscribe({
    ...settings().getRabbitMQConfig().queueConfig[QueueSymbols.NOTI_BATCH_NORMAL_DLQ],
    errorBehavior: MessageHandlerErrorBehavior.ACK,
    errorHandler: ackErrorHandler,
  })
  handleNormalBatchDLQ(@RabbitPayload() msg: BatchNotificationMessage) {
    logger.error(`[BatchController DLQ] NORMAL batch failed: ${JSON.stringify(msg)}`)
  }

  @RabbitSubscribe({
    ...settings().getRabbitMQConfig().queueConfig[QueueSymbols.NOTI_BATCH_BULK_DLQ],
    errorBehavior: MessageHandlerErrorBehavior.ACK,
    errorHandler: ackErrorHandler,
  })
  handleBulkBatchDLQ(@RabbitPayload() msg: BatchNotificationMessage) {
    logger.error(`[BatchController DLQ] BULK batch failed: ${JSON.stringify(msg)}`)
  }
}
