import { Injectable } from '@nestjs/common'
import { InjectRedis } from '@nestjs-modules/ioredis'
import { FCMNotificationRequest } from '@otl/server-nest/modules/notification/domain/notification'
import Redis from 'ioredis'

@Injectable()
export class NotificationSchedulerService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async scheduleNotification(msg: FCMNotificationRequest): Promise<boolean> {
    const key = 'notification:schedule'
    const score = new Date(msg.scheduleAt).getTime()
    await this.redis.zadd(key, score, JSON.stringify(msg))
    return true
  }
}
