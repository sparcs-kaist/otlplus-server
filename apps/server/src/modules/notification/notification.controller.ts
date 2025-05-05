import { Controller, Get, Inject } from '@nestjs/common'
import { Public } from '@otl/server-nest/common/decorators/skip-auth.decorator'
import {
  NOTIFICATION_IN_PORT,
  NotificationInPort,
} from '@otl/server-nest/modules/notification/domain/notification.in.public.port'
import { uuid } from 'uuidv4'

@Controller('notification')
export class NotificationController {
  constructor(
    @Inject(NOTIFICATION_IN_PORT)
    private readonly notificationInPort: NotificationInPort,
  ) {}

  @Public()
  @Get('/hello')
  async getHello() {
    return await this.notificationInPort.sendNotification(uuid(), 'Hello', 'Hello', { userId: 1, notificationId: 1 })
  }
}
