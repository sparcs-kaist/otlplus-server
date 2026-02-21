import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { SchedulerRegistry } from '@nestjs/schedule'
import {
  PUSH_NOTIFICATION_IN_PORT,
  PushNotificationInPort,
} from '@otl/server-nest/modules/notification/domain/push-notification.in.port'
import {
  PUSH_NOTIFICATION_REPOSITORY,
  PushNotificationRepository,
} from '@otl/server-nest/modules/notification/domain/push-notification.repository'
import { CronJob } from 'cron'

import logger from '@otl/common/logger/logger'

@Injectable()
export class CronSchedulerService implements OnModuleInit {
  constructor(
    @Inject(PUSH_NOTIFICATION_REPOSITORY)
    private readonly pushNotificationRepository: PushNotificationRepository,

    @Inject(PUSH_NOTIFICATION_IN_PORT)
    private readonly pushNotificationService: PushNotificationInPort,

    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async onModuleInit() {
    await this.loadCronJobs()
  }

  async loadCronJobs() {
    const cronNotifications = await this.pushNotificationRepository.findActiveCronNotifications()

    for (const notification of cronNotifications) {
      this.registerCronJob(notification.id, notification.name, notification.cronExpression!)
    }

    logger.info(`[CronScheduler] Loaded ${cronNotifications.length} cron notification jobs`)
  }

  registerCronJob(notificationId: number, name: string, cronExpression: string) {
    const jobName = `push-notification-cron-${notificationId}`

    // Remove existing job if present
    if (this.schedulerRegistry.doesExist('cron', jobName)) {
      this.schedulerRegistry.deleteCronJob(jobName)
    }

    const job = new CronJob(cronExpression, async () => {
      try {
        logger.info(`[CronScheduler] Executing cron notification: ${name} (id=${notificationId})`)
        await this.pushNotificationService.sendNotificationNow(notificationId)
      }
      catch (err) {
        logger.error(`[CronScheduler] Failed to execute cron notification ${notificationId}:`, err)
      }
    })

    this.schedulerRegistry.addCronJob(jobName, job)
    job.start()
    logger.info(`[CronScheduler] Registered cron job: ${jobName} with expression: ${cronExpression}`)
  }

  removeCronJob(notificationId: number) {
    const jobName = `push-notification-cron-${notificationId}`
    if (this.schedulerRegistry.doesExist('cron', jobName)) {
      this.schedulerRegistry.deleteCronJob(jobName)
      logger.info(`[CronScheduler] Removed cron job: ${jobName}`)
    }
  }

  updateCronJob(notificationId: number, name: string, cronExpression: string) {
    this.removeCronJob(notificationId)
    this.registerCronJob(notificationId, name, cronExpression)
  }
}
