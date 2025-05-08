import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import settings, { QueueNames } from '@otl/rmq/settings'

import { AppService } from './app.service'

@Injectable()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @RabbitSubscribe(settings().getRabbitMQConfig().queueConfig[QueueNames.NOTI_AD_FCM])
  handleOrderPlaced(msg: any) {
    return this.appService.handleOrderPlaced(msg)
  }

  @RabbitSubscribe(settings().getRabbitMQConfig().queueConfig[QueueNames.NOTI_INFO_FCM])
  handleMessage(msg: any) {
    return this.appService.handleOrderPlaced(msg)
  }
}
