import {
  Body, Controller, Get, Inject, Patch, Post,
} from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { Public } from '@otl/server-nest/common/decorators/skip-auth.decorator'
import { INotification } from '@otl/server-nest/common/interfaces/INotification'
import {
  NOTIFICATION_IN_PORT,
  NotificationInPort,
} from '@otl/server-nest/modules/notification/domain/notification.in.port'
import { session_userprofile } from '@prisma/client'
import { v6 } from 'uuid'

import { NotificationType } from '@otl/common/enum/notification'

@Controller('notification')
export class NotificationController {
  constructor(
    @Inject(NOTIFICATION_IN_PORT)
    private readonly notificationService: NotificationInPort,
  ) {}

  @Public()
  @Get('/hello')
  async getHello() {
    return await this.notificationService.sendNotification(v6(), 'Hello', 'Hello', {
      userId: 17931,
      scheduleAt: new Date(),
      notificationType: NotificationType.COURSE_TIME,
    })
  }

  @Post('/read')
  async read(@GetUser() user: session_userprofile, @Body() body: INotification.ReadDto) {
    const notificationRequest = await this.notificationService.getNotificationRequest(body.requestUUID)
    return await this.notificationService.readNotification(user.id, notificationRequest.id as number)
  }

  @Patch('/user')
  async allowOrDisallow(@GetUser() user: session_userprofile, @Body() body: INotification.ActiveDto) {
    return await this.notificationService.changeNotificationPermission(user.id, body.notificationType, body.active)
  }
}
