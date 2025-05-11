import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import { Interval } from '@nestjs/schedule'
import { InjectRedis } from '@nestjs-modules/ioredis'
import { FCMNotificationRequest } from '@otl/server-nest/modules/notification/domain/notification'
import Redis from 'ioredis'

import { AgreementType } from '@otl/common/enum/agreement'
import { NotificationAgreementMap } from '@otl/common/enum/notification'

@Injectable()
export class NotificationJobService {
  private readonly key = 'notification:schedule'

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly amqp: AmqpConnection,
  ) {}

  @Interval(1000)
  async handleDueNotifications() {
    const now = Date.now()
    const messages = await this.redis.zrangebyscore(this.key, 0, now)

    for (const raw of messages) {
      const msg = JSON.parse(raw)

      await this.amqp.publish('notifications', this.getRoutingKey(msg), msg)
      await this.redis.zrem(this.key, raw)
    }
  }

  private getRoutingKey(msg: FCMNotificationRequest) {
    const hour = new Date(msg.scheduleAt).getHours()
    const isNight = hour >= 22 || hour < 8
    const name = msg.notificationType

    if (NotificationAgreementMap[name] === AgreementType.INFO) return 'notifications.info.fcm'
    if (NotificationAgreementMap[name] === AgreementType.MARKETING) {
      return isNight ? 'notifications.night-ad.fcm' : 'notifications.ad.fcm'
    }
    throw new Error(`Unknown notification type: ${name}`)
  }
}
