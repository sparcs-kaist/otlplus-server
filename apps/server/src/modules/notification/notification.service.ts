import { Inject, Injectable } from '@nestjs/common'
import { NotificationRequest, UserNotification } from '@otl/server-nest/modules/notification/domain/notification'
import { NotificationInPort } from '@otl/server-nest/modules/notification/domain/notification.in.public.port'
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepository,
} from '@otl/server-nest/modules/notification/domain/notification.repository'
import { StatusCodes } from 'http-status-codes'

import { NotificationException } from '@otl/common/exception/notification.exception'

@Injectable()
export class NotificationService implements NotificationInPort {
  constructor(@Inject(NOTIFICATION_REPOSITORY) private readonly notificationRepository: NotificationRepository) {}

  changeNotificationPermission(_userId: number, _notificationId: number, _active: boolean): Promise<UserNotification> {
    throw new NotificationException(StatusCodes.NOT_IMPLEMENTED)
  }

  checkNotificationCompleted(_userId: number, _notificationRequestId: number): Promise<NotificationRequest> {
    throw new NotificationException(StatusCodes.NOT_IMPLEMENTED)
  }

  checkNotificationPermission(_userId: number, _notificationId: number): Promise<UserNotification> {
    throw new NotificationException(StatusCodes.NOT_IMPLEMENTED)
  }

  sendNotification(_deviceToken: string, _title: string, _body: string): Promise<NotificationRequest> {
    throw new NotificationException(StatusCodes.NOT_IMPLEMENTED)
  }

  sendNotificationToAll(_title: string, _body: string): Promise<NotificationRequest[]> {
    throw new NotificationException(StatusCodes.NOT_IMPLEMENTED)
  }
}
