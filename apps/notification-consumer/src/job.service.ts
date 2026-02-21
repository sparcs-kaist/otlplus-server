import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { Inject, Injectable } from '@nestjs/common'
import { Interval } from '@nestjs/schedule'
import { InjectRedis } from '@nestjs-modules/ioredis'
import {
  ConsumerNotificationRepository,
  NOTIFICATION_REPOSITORY,
} from '@otl/notification-consumer/out/notification.repository'
import { FCMNotificationRequest } from '@otl/server-nest/modules/notification/domain/notification'
import Redis from 'ioredis'

import { AgreementType } from '@otl/common/enum/agreement'
import logger from '@otl/common/logger/logger'

@Injectable()
export class NotificationJobService {
  private readonly key = 'notification:schedule'

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly amqp: AmqpConnection,
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: ConsumerNotificationRepository,
  ) {}

  @Interval(1000)
  async handleDueNotifications() {
    const now = Date.now()
    const messages = await this.redis.zrangebyscore(this.key, 0, now)

    for (const raw of messages) {
      try {
        const msg: FCMNotificationRequest = JSON.parse(raw)
        const routingKey = await this.getRoutingKey(msg)
        await this.amqp.publish('notifications', routingKey, msg)
        await this.redis.zrem(this.key, raw)
        logger.info(`[JobService] Published due notification for user ${msg.userId} to ${routingKey}`)
      }
      catch (err) {
        logger.error('[JobService] Failed to process due notification:', err)
        await this.redis.zrem(this.key, raw)
      }
    }
  }

  private async getRoutingKey(msg: FCMNotificationRequest): Promise<string> {
    const hour = new Date(msg.scheduleAt).getHours()
    const isNight = hour >= 22 || hour < 8

    const notification = await this.notificationRepository.getNotification(msg.notificationName)

    if (notification.agreementType === AgreementType.INFO) {
      return 'notifications.info.fcm'
    }
    if (notification.agreementType === AgreementType.MARKETING) {
      return isNight ? 'notifications.night-ad.fcm' : 'notifications.ad.fcm'
    }

    throw new Error(`Unknown notification type: ${msg.notificationName}`)
  }
}
