import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { Inject, Injectable } from '@nestjs/common'
import { NotificationRequest, UserNotification } from '@otl/server-nest/modules/notification/domain/notification'
import { NotificationInPort } from '@otl/server-nest/modules/notification/domain/notification.in.public.port'
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepository,
} from '@otl/server-nest/modules/notification/domain/notification.repository'
import { StatusCodes } from 'http-status-codes'
import { uuid } from 'uuidv4'

import { NotificationException } from '@otl/common/exception/notification.exception'

@Injectable()
export class NotificationService implements NotificationInPort {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY) private readonly notificationRepository: NotificationRepository,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  changeNotificationPermission(_userId: number, _notificationId: number, _active: boolean): Promise<UserNotification> {
    throw new NotificationException(StatusCodes.NOT_IMPLEMENTED)
  }

  checkNotificationCompleted(_userId: number, _notificationRequestId: number): Promise<NotificationRequest> {
    throw new NotificationException(StatusCodes.NOT_IMPLEMENTED)
  }

  checkNotificationPermission(_userId: number, _notificationId: number): Promise<UserNotification> {
    throw new NotificationException(StatusCodes.NOT_IMPLEMENTED)
  }

  async sendNotification(
    _deviceToken: string,
    _title: string,
    _body: string,
    other?: { userId: number, scheduledAt: Date, notificationId: number },
  ): Promise<NotificationRequest> {
    if (!other) {
      throw new NotificationException(StatusCodes.INTERNAL_SERVER_ERROR, NotificationException.METADATA_INSUFFICIENT)
    }
    const notiRequest: NotificationRequest = {
      ...other,
      content: {
        title: _title,
        body: _body,
      },
      scheduleAt: new Date(),
      isCompleted: false,
      isRead: false,
      requestId: uuid(),
    }
    await this.amqpConnection.publish('notifications', `notifications.info.fcm.${_deviceToken}`, notiRequest)
    return notiRequest
  }

  sendNotificationToAll(_title: string, _body: string): Promise<NotificationRequest[]> {
    throw new NotificationException(StatusCodes.NOT_IMPLEMENTED)
  }
}
