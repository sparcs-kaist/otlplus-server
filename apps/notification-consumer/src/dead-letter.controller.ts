import { MessageHandlerErrorBehavior, RabbitPayload, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { ackErrorHandler } from '@golevelup/nestjs-rabbitmq/lib/amqp/errorBehaviors'
import { Controller } from '@nestjs/common'
import settings, { QueueSymbols } from '@otl/rmq/settings'
import { FCMNotificationRequest } from '@otl/server-nest/modules/notification/domain/notification'
import { ConsumeMessage } from 'amqplib'
import { plainToInstance } from 'class-transformer'

import logger from '@otl/common/logger/logger'

import { AppService } from './app.service'

@Controller()
export class DeadLetterController {
  constructor(private readonly appService: AppService) {}

  @RabbitSubscribe({
    ...settings().getRabbitMQConfig().queueConfig[QueueSymbols.NOTI_FCM_DLQ],
    errorBehavior: MessageHandlerErrorBehavior.ACK,
    errorHandler: ackErrorHandler,
  })
  handleNotificationDLQ(@RabbitPayload() msg: FCMNotificationRequest, amqpMsg: ConsumeMessage) {
    logger.error(JSON.stringify(msg), amqpMsg)
  }

  @RabbitSubscribe({
    ...settings().getRabbitMQConfig().queueConfig[QueueSymbols.NOTI_INFO_FCM_DLQ],
    errorBehavior: MessageHandlerErrorBehavior.ACK,
    errorHandler: ackErrorHandler,
  })
  handleNotificationINFODLQ(msg: any, amqpMsg: ConsumeMessage) {
    logger.error(msg, amqpMsg)
  }

  @RabbitSubscribe({
    ...settings().getRabbitMQConfig().queueConfig[QueueSymbols.NOTI_AD_FCM_DLQ],
    errorBehavior: MessageHandlerErrorBehavior.ACK,
    errorHandler: ackErrorHandler,
  })
  handleNotificationADDLQ(msg: any, amqpMsg: ConsumeMessage) {
    const request = plainToInstance(FCMNotificationRequest, msg)
    logger.error(JSON.stringify(request), amqpMsg)
  }

  @RabbitSubscribe({
    ...settings().getRabbitMQConfig().queueConfig[QueueSymbols.NOTI_NIGHT_AD_FCM_DLQ],
    errorBehavior: MessageHandlerErrorBehavior.ACK,
    errorHandler: ackErrorHandler,
  })
  handleNotificationNightADDLQ(msg: any, amqpMsg: ConsumeMessage) {
    logger.error(msg, amqpMsg)
  }
}
