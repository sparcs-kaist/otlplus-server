import { Inject, Injectable } from '@nestjs/common'
import { messaging } from 'firebase-admin'
import { getMessaging } from 'firebase-admin/messaging'

import Message = messaging.Message
import { AGREEMENT_REPOSITORY, ConsumerAgreementRepository } from '@otl/notification-consumer/out/agreement.repository'
import { NOTIFICATION_MQ, NotificationConsumerMQ } from '@otl/notification-consumer/out/notification.mq'
import {
  ConsumerNotificationRepository,
  NOTIFICATION_REPOSITORY,
} from '@otl/notification-consumer/out/notification.repository'
import { NotificationSchedulerService } from '@otl/notification-consumer/schedule.service'
import { FCMNotificationRequest } from '@otl/server-nest/modules/notification/domain/notification'
import { ConsumeMessage } from 'amqplib'
import { StatusCodes } from 'http-status-codes'

import { getCurrentMethodName } from '@otl/common'
import { AgreementType } from '@otl/common/enum/agreement'
import { AgreementException } from '@otl/common/exception/agreement.exception'
import { NotificationException } from '@otl/common/exception/notification.exception'
import logger from '@otl/common/logger/logger'

@Injectable()
export class AppService {
  constructor(
    @Inject(AGREEMENT_REPOSITORY)
    private readonly agreementRepository: ConsumerAgreementRepository,
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: ConsumerNotificationRepository,
    @Inject(NOTIFICATION_MQ)
    private readonly notificationConsumerMQ: NotificationConsumerMQ,
    private readonly notificationSchedulerService: NotificationSchedulerService,
  ) {}

  async handleNotification(msg: FCMNotificationRequest, _amqpMsg: ConsumeMessage): Promise<boolean> {
    const name = msg.notificationName
    const delayMs = new Date(msg.scheduleAt).getTime() - Date.now()

    // 10분 이상 남았으면 예약 저장
    if (delayMs >= 10 * 60 * 1000) {
      logger.info(`Scheduled notification (${msg.notificationName}) to be sent after ${delayMs}ms`)
      return await this.notificationSchedulerService.scheduleNotification(msg)
    }

    const hour = new Date(msg.scheduleAt).getHours()
    const isNightTime = hour >= 22 || hour < 8

    const notification = await this.notificationRepository.getNotification(name)

    if (notification.agreementType === AgreementType.INFO) {
      return await this.notificationConsumerMQ.publishInfoNotification(msg)
    }
    if (notification.agreementType === AgreementType.MARKETING) {
      if (isNightTime) {
        return await this.notificationConsumerMQ.publishNightAdNotification(msg)
      }
      return await this.notificationConsumerMQ.publishAdNotification(msg)
    }

    throw new NotificationException(
      StatusCodes.INTERNAL_SERVER_ERROR,
      NotificationException.NO_NOTIFICATION,
      getCurrentMethodName(),
    )
  }

  async handleAdNotification(msg: FCMNotificationRequest) {
    console.log(msg)
    return this.sendFCM(msg)
  }

  async handleNightAdNotification(msg: FCMNotificationRequest) {
    const { userId, scheduleAt } = msg

    const userAgreement = await this.agreementRepository.findByUserIdAndType(userId, AgreementType.NIGHT_MARKETING)

    const originalSchedule = new Date(scheduleAt)
    const hour = originalSchedule.getHours()
    const isNight = hour >= 22 || hour < 8

    if (!userAgreement) {
      throw new AgreementException(
        StatusCodes.INTERNAL_SERVER_ERROR,
        AgreementException.DOES_NOT_EXIST_MESSAGE,
        getCurrentMethodName(),
      )
    }

    if (isNight && !userAgreement.agreementStatus) {
      const nextMorning = new Date(originalSchedule)

      if (hour < 8) {
        nextMorning.setHours(8, 0, 0, 0)
      }
      // 밤 22시~23시라면, 다음날 오전 8시로
      else {
        nextMorning.setDate(nextMorning.getDate() + 1)
        nextMorning.setHours(8, 0, 0, 0)
      }
      const newMsg = {
        ...msg,
        scheduleAt: nextMorning,
      }

      logger.info(`[NightAd] user ${userId} declined night marketing → delayed to ${newMsg.scheduleAt}`)
      return this.sendFCM(newMsg)
    }

    return this.sendFCM(msg)
  }

  async handleInfoNotification(msg: FCMNotificationRequest) {
    return this.sendFCM(msg)
  }

  async sendFCM(msg: FCMNotificationRequest) {
    const {
      content, userId, scheduleAt, notificationName, requestId, deviceToken,
    } = msg
    const { title, body } = content

    const message: Message = {
      token: deviceToken as string,
      notification: {
        title,
        body,
      },
      apns: { payload: { aps: { alert: { title, body } } } },
      android: {
        priority: 'high' as const,
      },
      webpush: {},
    }

    console.log(message)
    const response = await getMessaging().send(message)
    console.log(response)
    await this.notificationRepository.saveRequest({
      notificationName,
      userId,
      content,
      requestId,
      scheduleAt,
      fcmId: response,
      isCompleted: true,
      isRead: false,
      deviceToken,
    })
  }
}
