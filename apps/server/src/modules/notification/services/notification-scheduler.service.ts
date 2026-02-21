import { Inject, Injectable } from '@nestjs/common'
import { Interval } from '@nestjs/schedule'
import {
  PUSH_NOTIFICATION_IN_PORT,
  PushNotificationInPort,
} from '@otl/server-nest/modules/notification/domain/push-notification.in.port'
import {
  PUSH_NOTIFICATION_REPOSITORY,
  PushNotificationRepository,
} from '@otl/server-nest/modules/notification/domain/push-notification.repository'

import logger from '@otl/common/logger/logger'

@Injectable()
export class NotificationSchedulerService {
  constructor(
    @Inject(PUSH_NOTIFICATION_REPOSITORY)
    private readonly pushNotificationRepository: PushNotificationRepository,

    @Inject(PUSH_NOTIFICATION_IN_PORT)
    private readonly pushNotificationService: PushNotificationInPort,
  ) {}

  @Interval(30_000)
  async handleDueOneTimeNotifications() {
    try {
      const now = new Date()
      const dueNotifications = await this.pushNotificationRepository.findDueOneTimeNotifications(now)

      for (const notification of dueNotifications) {
        try {
          logger.info(`[Scheduler] Sending due ONE_TIME notification: ${notification.name} (id=${notification.id})`)
          await this.pushNotificationService.sendNotificationNow(notification.id)
          await this.pushNotificationRepository.update(notification.id, { isActive: false })
        }
        catch (err) {
          logger.error(`[Scheduler] Failed to send notification ${notification.id}:`, err)
        }
      }
    }
    catch (err) {
      logger.error('[Scheduler] Failed to check due notifications:', err)
    }
  }
}
