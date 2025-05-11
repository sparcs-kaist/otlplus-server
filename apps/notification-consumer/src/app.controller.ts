import { defaultNackErrorHandler, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { Controller } from '@nestjs/common'
import settings, { QueueNames } from '@otl/rmq/settings'
import { FCMNotificationRequest } from '@otl/server-nest/modules/notification/domain/notification'
import { ConsumeMessage } from 'amqplib'
import { plainToInstance } from 'class-transformer'

import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @RabbitSubscribe({
    ...settings().getRabbitMQConfig().queueConfig[QueueNames.NOTI_FCM],
    errorHandler: defaultNackErrorHandler,
  })
  handleNotification(msg: any, amqpMsg: ConsumeMessage) {
    const request = plainToInstance(FCMNotificationRequest, msg)
    return this.appService.handleNotification(request, amqpMsg)
  }

  @RabbitSubscribe({
    ...settings().getRabbitMQConfig().queueConfig[QueueNames.NOTI_INFO_FCM],
    errorHandler: defaultNackErrorHandler,
  })
  handleInfoNotification(msg: any) {
    return this.appService.handleInfoNotification(msg)
  }

  @RabbitSubscribe({
    ...settings().getRabbitMQConfig().queueConfig[QueueNames.NOTI_AD_FCM],
    errorHandler: defaultNackErrorHandler,
  })
  handleAdNotification(msg: any) {
    return this.appService.handleAdNotification(msg)
  }

  @RabbitSubscribe({
    ...settings().getRabbitMQConfig().queueConfig[QueueNames.NOTI_NIGHT_AD_FCM],
    errorHandler: defaultNackErrorHandler,
  })
  handleNightAdNotification(msg: any) {
    return this.appService.handleNightAdNotification(msg)
  }
}
