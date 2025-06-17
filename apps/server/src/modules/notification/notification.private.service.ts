import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { Inject, Injectable } from '@nestjs/common'
import {
  AGREEMENT_REPOSITORY,
  AgreementRepository,
} from '@otl/server-nest/modules/agreement/domain/agreement.repository'
import {
  FCMNotificationRequest,
  Notification,
  UserNotification,
} from '@otl/server-nest/modules/notification/domain/notification'
import { NotificationInPort } from '@otl/server-nest/modules/notification/domain/notification.in.port'
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepository,
} from '@otl/server-nest/modules/notification/domain/notification.repository'
import { NotificationPublicService } from '@otl/server-nest/modules/notification/notification.public.service'
import { StatusCodes } from 'http-status-codes'

import { getCurrentMethodName } from '@otl/common'
import { AgreementType } from '@otl/common/enum/agreement'
import { NotificationException } from '@otl/common/exception/notification.exception'

@Injectable()
export class NotificationPrivateService extends NotificationPublicService implements NotificationInPort {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY) protected readonly notificationRepository: NotificationRepository,
    @Inject(AGREEMENT_REPOSITORY) protected readonly agreementRepository: AgreementRepository,
    protected readonly amqpConnection: AmqpConnection,
  ) {
    super(notificationRepository, agreementRepository, amqpConnection)
  }

  async changeNotificationPermission(
    userId: number,
    notificationName: string,
    active: boolean,
  ): Promise<UserNotification> {
    const userNotification = await this.notificationRepository.findByUserIdAndType(userId, notificationName)
    if (!userNotification) {
      throw new NotificationException(
        StatusCodes.INTERNAL_SERVER_ERROR,
        NotificationException.NO_NOTIFICATION_USER,
        getCurrentMethodName(),
      )
    }
    userNotification.active = active
    await this.notificationRepository.save(userNotification)
    return userNotification
  }

  async readNotification(userId: number, requestId: number): Promise<FCMNotificationRequest> {
    const request = await this.notificationRepository.getNotificationRequestById(requestId)
    request.isRead = true
    return await this.notificationRepository.saveRequest(request)
  }

  createNotification(name: string, description: string, agreementType: AgreementType): Promise<Notification> {
    const notification = new Notification()
    notification.name = name
    notification.description = description
    notification.agreementType = agreementType

    return this.notificationRepository.createNotification(notification)
  }

  deleteNotification(id: number): Promise<void> {
    return this.notificationRepository.deleteNotification(id)
  }

  getAllNotification(): Promise<Notification[]> {
    return this.notificationRepository.getAllNotification()
  }

  getNotificationByName(name: string): Promise<Notification> {
    return this.notificationRepository.getNotification(name)
  }

  updateNotification(
    id: number,
    name: string,
    description: string,
    agreementType: AgreementType,
  ): Promise<Notification> {
    const notification = new Notification()
    notification.id = id
    notification.name = name
    notification.description = description
    notification.agreementType = agreementType

    return this.notificationRepository.updateNotification(notification)
  }
}
