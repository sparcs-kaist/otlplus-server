import { Controller } from '@nestjs/common'
import { EventPattern, Payload } from '@nestjs/microservices'
import { AppDto } from '@otl/notification-consumer/dto'

import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('app-force-update')
  handleOrderPlaced(@Payload() data: AppDto) {
    return this.appService.handleOrderPlaced(data)
  }

  @EventPattern('notification.info.fcm')
  handleMessage(@Payload() data: AppDto) {
    return this.appService.handleOrderPlaced(data)
  }
}
