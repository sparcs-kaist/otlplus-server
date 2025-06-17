import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { Inject, Injectable } from '@nestjs/common'
import {
  AGREEMENT_REPOSITORY,
  AgreementRepository,
} from '@otl/server-nest/modules/agreement/domain/agreement.repository'
import { FCMNotificationRequest, Notification } from '@otl/server-nest/modules/notification/domain/notification'
import { NotificationInPublicPort } from '@otl/server-nest/modules/notification/domain/notification.in.public.port'
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepository,
} from '@otl/server-nest/modules/notification/domain/notification.repository'
import { StatusCodes } from 'http-status-codes'
import { v6 } from 'uuid'

import { getCurrentMethodName } from '@otl/common'
import { AgreementException } from '@otl/common/exception/agreement.exception'
import { NotificationException } from '@otl/common/exception/notification.exception'
import { _NotificationRequest } from '@otl/common/notification/notification'

@Injectable()
export class NotificationPublicService implements NotificationInPublicPort {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY) protected readonly notificationRepository: NotificationRepository,
    @Inject(AGREEMENT_REPOSITORY) protected readonly agreementRepository: AgreementRepository,
    protected readonly amqpConnection: AmqpConnection,
  ) {}

  async checkNotificationCompleted(uuid: string): Promise<FCMNotificationRequest | null> {
    return await this.notificationRepository.getNotificationRequest(uuid)
  }

  async checkNotificationPermission(userId: number, notificationName: string): Promise<boolean> {
    const notification = await this.notificationRepository.getNotification(notificationName)
    const userNotification = await this.notificationRepository.findByUserIdAndType(userId, notificationName)
    const userAgreement = await this.agreementRepository.findByUserIdAndType(userId, notification.agreementType)
    if (!userAgreement) {
      throw new AgreementException(
        StatusCodes.INTERNAL_SERVER_ERROR,
        AgreementException.DOES_NOT_EXIST_MESSAGE,
        getCurrentMethodName(),
      )
    }
    if (!userNotification) {
      throw new NotificationException(
        StatusCodes.INTERNAL_SERVER_ERROR,
        NotificationException.NO_NOTIFICATION_USER,
        getCurrentMethodName(),
      )
    }
    return userAgreement.agreementStatus && userNotification.active
  }

  async sendNotification(
    to: string,
    title: string,
    body: string,
    other: { userId: number, scheduleAt: Date, notificationName: string },
  ): Promise<FCMNotificationRequest> {
    const { userId, scheduleAt, notificationName } = other
    if (!(await this.checkNotificationPermission(userId, notificationName))) {
      throw new NotificationException(
        StatusCodes.FORBIDDEN,
        NotificationException.FORBIDDEN_NOTIFICATION,
        getCurrentMethodName(),
      )
    }
    const notiRequest: FCMNotificationRequest = {
      ...other,
      id: null,
      content: {
        title,
        body,
      },
      deviceToken: to,
      isCompleted: false,
      isRead: false,
      scheduleAt,
      requestId: v6(),
    }
    await this.amqpConnection.publish('notifications', 'notifications.fcm', notiRequest)
    return notiRequest
  }

  sendNotificationToAll(_title: string, _body: string): Promise<FCMNotificationRequest[]> {
    throw new NotificationException(StatusCodes.NOT_IMPLEMENTED, NotificationException.DEFAULT_MESSAGE)
  }

  async getNotificationRequest(uuid: string): Promise<_NotificationRequest> {
    const request = await this.notificationRepository.getNotificationRequest(uuid)
    if (!request) {
      throw new NotificationException(
        StatusCodes.INTERNAL_SERVER_ERROR,
        NotificationException.NO_NOTIFICATION_REQUEST,
        getCurrentMethodName(),
      )
    }
    return request
  }

  async getNotification(name: string): Promise<Notification | null> {
    const notification = await this.notificationRepository.getNotification(name)
    if (!notification) {
      throw new NotificationException(
        StatusCodes.NOT_FOUND,
        NotificationException.NO_NOTIFICATION,
        getCurrentMethodName(),
      )
    }
    return notification
  }
}
