import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { Inject, Injectable } from '@nestjs/common'
import {
  AGREEMENT_REPOSITORY,
  AgreementRepository,
} from '@otl/server-nest/modules/agreement/domain/agreement.repository'
import { FCMNotificationRequest, UserNotification } from '@otl/server-nest/modules/notification/domain/notification'
import { NotificationInPort } from '@otl/server-nest/modules/notification/domain/notification.in.port'
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepository,
} from '@otl/server-nest/modules/notification/domain/notification.repository'
import { NotificationPublicService } from '@otl/server-nest/modules/notification/notification.public.service'
import { StatusCodes } from 'http-status-codes'

import { getCurrentMethodName } from '@otl/common'
import { NotificationType } from '@otl/common/enum/notification'
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
    notificationType: NotificationType,
    active: boolean,
  ): Promise<UserNotification> {
    const userNotification = await this.notificationRepository.findByUserIdAndType(userId, notificationType)
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
}
