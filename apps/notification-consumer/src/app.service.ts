import { Injectable } from '@nestjs/common'
import { messaging } from 'firebase-admin'
import { getMessaging } from 'firebase-admin/messaging'

import { PrismaService } from '@otl/prisma-client'
import Message = messaging.Message
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { NotificationSchedulerService } from '@otl/notification-consumer/schedule.service'
import { FCMNotificationRequest } from '@otl/server-nest/modules/notification/domain/notification'
import { ConsumeMessage } from 'amqplib'
import { StatusCodes } from 'http-status-codes'

import { getCurrentMethodName } from '@otl/common'
import { AgreementType } from '@otl/common/enum/agreement'
import { NotificationAgreementMap, NotificationType } from '@otl/common/enum/notification'
import { AgreementException } from '@otl/common/exception/agreement.exception'
import { NotificationException } from '@otl/common/exception/notification.exception'
import logger from '@otl/common/logger/logger'

import { NotificationPrismaRepository } from '@otl/prisma-client/repositories/notification.repository'

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationSchedulerService: NotificationSchedulerService,
    private readonly notificationRepository: NotificationPrismaRepository,
    protected readonly amqpConnection: AmqpConnection,
  ) {}

  async handleNotification(msg: FCMNotificationRequest, _amqpMsg: ConsumeMessage) {
    const name = Object.values(NotificationType).find((e) => e === msg.notificationType)
    if (!name) {
      throw new NotificationException(
        StatusCodes.INTERNAL_SERVER_ERROR,
        NotificationException.NO_NOTIFICATION,
        getCurrentMethodName(),
      )
    }

    const delayMs = new Date(msg.scheduleAt).getTime() - Date.now()

    // 10분 이상 남았으면 예약 저장
    if (delayMs >= 10 * 60 * 1000) {
      logger.info(`Scheduled notification (${msg.notificationType}) to be sent after ${delayMs}ms`)
      await this.notificationSchedulerService.scheduleNotification(msg)
      return
    }

    const hour = new Date(msg.scheduleAt).getHours()
    const isNightTime = hour >= 22 || hour < 8

    let routingKey = ''
    if (NotificationAgreementMap[name] === AgreementType.INFO) {
      routingKey = 'notifications.info.fcm'
    }
    else if (NotificationAgreementMap[name] === AgreementType.MARKETING) {
      routingKey = isNightTime ? 'notifications.night-ad.fcm' : 'notifications.ad.fcm'
    }
    else {
      throw new NotificationException(
        StatusCodes.INTERNAL_SERVER_ERROR,
        NotificationException.NO_NOTIFICATION,
        getCurrentMethodName(),
      )
    }
    console.log(routingKey, msg)
    await this.amqpConnection.publish('notifications', routingKey, msg)
  }

  async handleAdNotification(msg: FCMNotificationRequest) {
    console.log(msg)
    return this.sendFCM(msg)
  }

  async handleNightAdNotification(msg: FCMNotificationRequest) {
    const { userId, scheduleAt } = msg

    const userAgreement = await this.prisma.session_userprofile_agreement.findFirst({
      where: {
        userprofile_id: userId,
        agreement: {
          name: AgreementType.NIGHT_MARKETING,
        },
      },
    })

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

    if (isNight && userAgreement.agreement_status === false) {
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
      content, userId, scheduleAt, notificationType, requestId, deviceToken,
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
      notificationType,
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
