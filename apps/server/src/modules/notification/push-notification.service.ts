import { Inject, Injectable } from '@nestjs/common'
import { DEVICE_REPOSITORY, DeviceRepository } from '@otl/server-nest/modules/device/domain/device.repository'
import {
  PushNotification,
  PushNotificationBatch,
  PushNotificationHistory,
} from '@otl/server-nest/modules/notification/domain/push-notification.domain'
import {
  BatchStatus,
  NotificationHistoryStatus,
} from '@otl/server-nest/modules/notification/domain/push-notification.enums'
import { PushNotificationInPort } from '@otl/server-nest/modules/notification/domain/push-notification.in.port'
import { BatchNotificationMessage } from '@otl/server-nest/modules/notification/domain/push-notification.message'
import {
  PUSH_NOTIFICATION_MQ,
  PushNotificationMq,
} from '@otl/server-nest/modules/notification/domain/push-notification.mq'
import {
  PUSH_NOTIFICATION_REPOSITORY,
  PushNotificationRepository,
} from '@otl/server-nest/modules/notification/domain/push-notification.repository'
import { RateLimiterService } from '@otl/server-nest/modules/notification/services/rate-limiter.service'
import { TargetResolverService } from '@otl/server-nest/modules/notification/services/target-resolver.service'
import { TemplateEngineService } from '@otl/server-nest/modules/notification/services/template-engine.service'
import { StatusCodes } from 'http-status-codes'
import { v6 } from 'uuid'

import { AgreementType } from '@otl/common/enum/agreement'
import { NotificationException } from '@otl/common/exception/notification.exception'
import logger from '@otl/common/logger/logger'
import { getCurrentMethodName } from '@otl/common/utils'

const MAX_RECIPIENTS_PER_BATCH = 500

@Injectable()
export class PushNotificationService implements PushNotificationInPort {
  constructor(
    @Inject(PUSH_NOTIFICATION_REPOSITORY)
    private readonly repo: PushNotificationRepository,

    @Inject(PUSH_NOTIFICATION_MQ)
    private readonly mq: PushNotificationMq,

    @Inject(DEVICE_REPOSITORY)
    private readonly deviceRepository: DeviceRepository,

    private readonly templateEngine: TemplateEngineService,
    private readonly rateLimiter: RateLimiterService,
    private readonly targetResolver: TargetResolverService,
  ) {}

  // --- Admin CRUD ---

  async createPushNotification(
    data: Parameters<PushNotificationInPort['createPushNotification']>[0],
  ): Promise<PushNotification> {
    return this.repo.create({
      name: data.name,
      type: data.type,
      titleTemplate: data.titleTemplate,
      bodyTemplate: data.bodyTemplate,
      targetType: data.targetType,
      targetFilter: data.targetFilter ?? null,
      scheduleType: data.scheduleType,
      scheduleAt: data.scheduleAt ?? null,
      cronExpression: data.cronExpression ?? null,
      priority: data.priority ?? 'NORMAL',
      digestKey: data.digestKey ?? null,
      digestWindowSec: data.digestWindowSec ?? null,
      isActive: data.isActive ?? true,
      createdBy: data.createdBy ?? null,
    })
  }

  async updatePushNotification(
    id: number,
    data: Parameters<PushNotificationInPort['updatePushNotification']>[1],
  ): Promise<PushNotification> {
    return this.repo.update(id, data as Partial<Omit<PushNotification, 'id' | 'createdAt' | 'updatedAt'>>)
  }

  async deletePushNotification(id: number): Promise<void> {
    return this.repo.delete(id)
  }

  async getPushNotification(id: number): Promise<PushNotification | null> {
    return this.repo.findById(id)
  }

  async listPushNotifications(): Promise<PushNotification[]> {
    return this.repo.findAll()
  }

  // --- Send ---

  async sendNotificationNow(id: number, templateVars?: Record<string, string>): Promise<PushNotificationBatch> {
    // 1. Get notification config
    const notification = await this.repo.findById(id)
    if (!notification) {
      throw new NotificationException(StatusCodes.NOT_FOUND, 'Push notification not found', getCurrentMethodName())
    }

    // 2. Template rendering
    const vars = templateVars ?? {}
    const title = this.templateEngine.render(notification.titleTemplate, vars)
    const body = this.templateEngine.render(notification.bodyTemplate, vars)

    // 3. Target resolution
    let targetUserIds = await this.targetResolver.resolveTargetUserIds(
      notification.targetType,
      notification.targetFilter,
      notification.type,
    )

    // 4. Night marketing consent filter
    if (notification.type === AgreementType.MARKETING || notification.type === AgreementType.NIGHT_MARKETING) {
      targetUserIds = await this.targetResolver.filterByNightMarketingConsent(targetUserIds, notification.type)
    }

    // 5. Per-user rate limit check — filter out rate-limited users
    const rateLimitedUserIds: number[] = []
    for (const userId of targetUserIds) {
      const allowed = await this.rateLimiter.checkRateLimit(userId, notification.name, notification.type)
      if (allowed) {
        rateLimitedUserIds.push(userId)
      }
    }
    targetUserIds = rateLimitedUserIds

    if (targetUserIds.length === 0) {
      logger.info(`[PushNotificationService] No target users for notification ${notification.name}`)
      return this.repo.createBatch({
        notificationId: notification.id,
        batchId: v6(),
        totalCount: 0,
        sentCount: 0,
        failedCount: 0,
        status: BatchStatus.COMPLETED,
        startedAt: new Date(),
        completedAt: new Date(),
      })
    }

    // 6. Device bulk lookup
    const devices = await this.deviceRepository.findActiveDevicesByUserIds(targetUserIds)
    if (devices.length === 0) {
      logger.info(`[PushNotificationService] No active devices for notification ${notification.name}`)
      return this.repo.createBatch({
        notificationId: notification.id,
        batchId: v6(),
        totalCount: 0,
        sentCount: 0,
        failedCount: 0,
        status: BatchStatus.COMPLETED,
        startedAt: new Date(),
        completedAt: new Date(),
      })
    }

    // 7. Create batch
    const batchUuid = v6()
    const batch = await this.repo.createBatch({
      notificationId: notification.id,
      batchId: batchUuid,
      totalCount: devices.length,
      sentCount: 0,
      failedCount: 0,
      status: BatchStatus.PENDING,
      startedAt: new Date(),
      completedAt: null,
    })

    // 8. Create history records
    const now = new Date()
    const historyRecords: Omit<PushNotificationHistory, 'id' | 'createdAt'>[] = devices.map((device) => ({
      batchId: batch.id,
      notificationId: notification.id,
      userId: device.userId,
      deviceId: device.id,
      fcmToken: device.deviceToken,
      notificationType: notification.type,
      priority: notification.priority,
      title,
      body,
      status: NotificationHistoryStatus.QUEUED,
      fcmMessageId: null,
      errorCode: null,
      errorMessage: null,
      idempotencyKey: `${notification.id}:${device.userId}:${device.id}:${batchUuid}`,
      queuedAt: now,
      sentAt: null,
      deliveredAt: null,
      readAt: null,
    }))

    const historyIds = await this.repo.createHistoryBatch(historyRecords)

    // 9. Chunk into max 500 recipients per message and publish
    const recipientEntries = devices.map((device, i) => ({
      historyId: historyIds[i],
      userId: device.userId,
      deviceId: device.id,
      fcmToken: device.deviceToken,
    }))

    for (let i = 0; i < recipientEntries.length; i += MAX_RECIPIENTS_PER_BATCH) {
      const chunk = recipientEntries.slice(i, i + MAX_RECIPIENTS_PER_BATCH)
      const message: BatchNotificationMessage = {
        notificationId: notification.id,
        batchId: batchUuid,
        type: notification.type,
        priority: notification.priority,
        title,
        body,
        data: {
          notificationName: notification.name,
          notificationId: String(notification.id),
        },
        recipients: chunk,
      }

      await this.mq.publishBatch(message, notification.priority)
    }

    // 10. Update batch status to PROCESSING
    await this.repo.updateBatchStatus(batchUuid, BatchStatus.PROCESSING)

    logger.info(
      `[PushNotificationService] Queued ${devices.length} notifications for ${notification.name} (batch=${batchUuid})`,
    )

    return { ...batch, status: BatchStatus.PROCESSING as BatchStatus }
  }

  // --- Status ---

  async getDeliveryStatus(id: number): Promise<{
    batch: PushNotificationBatch | null
    histories: PushNotificationHistory[]
  }> {
    const batch = await this.repo.findLatestBatchByNotificationId(id)
    if (!batch) {
      return { batch: null, histories: [] }
    }

    const histories = await this.repo.getHistoriesByBatchId(batch.id)
    return { batch, histories }
  }
}
