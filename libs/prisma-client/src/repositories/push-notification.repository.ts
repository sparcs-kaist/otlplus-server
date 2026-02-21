import { Injectable } from '@nestjs/common'
import {
  PushNotification,
  PushNotificationBatch,
  PushNotificationHistory,
  UserPushAgreement,
} from '@otl/server-nest/modules/notification/domain/push-notification.domain'
import {
  BatchStatus,
  NotificationHistoryStatus,
  NotificationScheduleType,
} from '@otl/server-nest/modules/notification/domain/push-notification.enums'
import { PushNotificationRepository } from '@otl/server-nest/modules/notification/domain/push-notification.repository'
import { Prisma } from '@prisma/client'

import {
  mapPushNotification,
  mapPushNotificationBatch,
  mapPushNotificationHistory,
  mapUserPushAgreement,
} from '@otl/prisma-client/common/mapper/push-notification'
import { PrismaService } from '@otl/prisma-client/prisma.service'

@Injectable()
export class PushNotificationPrismaRepository implements PushNotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  // --- PushNotification CRUD ---

  async create(data: Omit<PushNotification, 'id' | 'createdAt' | 'updatedAt'>): Promise<PushNotification> {
    const entity = await this.prisma.push_notification.create({
      data: {
        name: data.name,
        type: data.type,
        titleTemplate: data.titleTemplate,
        bodyTemplate: data.bodyTemplate,
        targetType: data.targetType,
        targetFilter:
          data.targetFilter === null
            ? Prisma.JsonNull
            : ((data.targetFilter as Prisma.InputJsonValue) ?? Prisma.JsonNull),
        scheduleType: data.scheduleType,
        scheduleAt: data.scheduleAt,
        cronExpression: data.cronExpression,
        priority: data.priority,
        digestKey: data.digestKey,
        digestWindowSec: data.digestWindowSec,
        isActive: data.isActive,
        createdBy: data.createdBy,
      },
    })
    return mapPushNotification(entity)
  }

  async update(
    id: number,
    data: Partial<Omit<PushNotification, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<PushNotification> {
    const updateData: Record<string, unknown> = { ...data }

    // Handle Prisma Json null semantics
    if ('targetFilter' in data) {
      updateData.targetFilter = data.targetFilter === null ? Prisma.JsonNull : data.targetFilter
    }

    const entity = await this.prisma.push_notification.update({
      where: { id },
      data: updateData as Prisma.push_notificationUpdateInput,
    })
    return mapPushNotification(entity)
  }

  async delete(id: number): Promise<void> {
    await this.prisma.push_notification.delete({ where: { id } })
  }

  async findById(id: number): Promise<PushNotification | null> {
    const entity = await this.prisma.push_notification.findUnique({ where: { id } })
    return entity ? mapPushNotification(entity) : null
  }

  async findAll(): Promise<PushNotification[]> {
    const entities = await this.prisma.push_notification.findMany({ orderBy: { id: 'desc' } })
    return entities.map(mapPushNotification)
  }

  async findByName(name: string): Promise<PushNotification | null> {
    const entity = await this.prisma.push_notification.findUnique({ where: { name } })
    return entity ? mapPushNotification(entity) : null
  }

  // --- Schedule queries ---

  async findDueOneTimeNotifications(now: Date): Promise<PushNotification[]> {
    const entities = await this.prisma.push_notification.findMany({
      where: {
        scheduleType: NotificationScheduleType.ONE_TIME,
        isActive: true,
        scheduleAt: { lte: now },
      },
    })
    return entities.map(mapPushNotification)
  }

  async findActiveCronNotifications(): Promise<PushNotification[]> {
    const entities = await this.prisma.push_notification.findMany({
      where: {
        scheduleType: NotificationScheduleType.CRON,
        isActive: true,
        cronExpression: { not: null },
      },
    })
    return entities.map(mapPushNotification)
  }

  // --- Batch management ---

  async createBatch(data: Omit<PushNotificationBatch, 'id' | 'createdAt'>): Promise<PushNotificationBatch> {
    const entity = await this.prisma.push_notification_batch.create({
      data: {
        notificationId: data.notificationId,
        batchId: data.batchId,
        totalCount: data.totalCount,
        sentCount: data.sentCount,
        failedCount: data.failedCount,
        status: data.status,
        startedAt: data.startedAt,
        completedAt: data.completedAt,
      },
    })
    return mapPushNotificationBatch(entity)
  }

  async updateBatchCounts(batchId: string, sentCount: number, failedCount: number): Promise<void> {
    await this.prisma.push_notification_batch.update({
      where: { batchId },
      data: {
        sentCount: { increment: sentCount },
        failedCount: { increment: failedCount },
      },
    })
  }

  async completeBatch(batchId: string): Promise<void> {
    await this.prisma.push_notification_batch.update({
      where: { batchId },
      data: {
        status: BatchStatus.COMPLETED,
        completedAt: new Date(),
      },
    })
  }

  async findBatchByBatchId(batchId: string): Promise<PushNotificationBatch | null> {
    const entity = await this.prisma.push_notification_batch.findUnique({ where: { batchId } })
    return entity ? mapPushNotificationBatch(entity) : null
  }

  async findLatestBatchByNotificationId(notificationId: number): Promise<PushNotificationBatch | null> {
    const entity = await this.prisma.push_notification_batch.findFirst({
      where: { notificationId },
      orderBy: { id: 'desc' },
    })
    return entity ? mapPushNotificationBatch(entity) : null
  }

  async updateBatchStatus(batchId: string, status: string): Promise<void> {
    await this.prisma.push_notification_batch.update({
      where: { batchId },
      data: { status },
    })
  }

  // --- History management ---

  async createHistoryBatch(histories: Omit<PushNotificationHistory, 'id' | 'createdAt'>[]): Promise<number[]> {
    // createMany doesn't return ids, so we use a transaction:
    // first createMany, then query back by idempotencyKey
    const data = histories.map((h) => ({
      batchId: h.batchId,
      notificationId: h.notificationId,
      userId: h.userId,
      deviceId: h.deviceId,
      fcmToken: h.fcmToken,
      notificationType: h.notificationType,
      priority: h.priority,
      title: h.title,
      body: h.body,
      status: h.status,
      idempotencyKey: h.idempotencyKey,
      queuedAt: h.queuedAt ?? new Date(),
    }))

    await this.prisma.push_notification_history.createMany({
      data,
      skipDuplicates: true,
    })

    // Fetch back the created records to get IDs
    const keys = histories.map((h) => h.idempotencyKey)
    const created = await this.prisma.push_notification_history.findMany({
      where: { idempotencyKey: { in: keys } },
      select: { id: true, idempotencyKey: true },
      orderBy: { id: 'asc' },
    })

    // Return IDs in the same order as input
    const keyToId = new Map(created.map((c) => [c.idempotencyKey, c.id]))
    return histories.map((h) => keyToId.get(h.idempotencyKey) ?? 0)
  }

  async updateHistoryStatus(
    historyId: number,
    status: NotificationHistoryStatus,
    extra?: { fcmMessageId?: string, sentAt?: Date, errorCode?: string, errorMessage?: string },
  ): Promise<void> {
    await this.prisma.push_notification_history.update({
      where: { id: historyId },
      data: {
        status,
        ...(extra?.fcmMessageId && { fcmMessageId: extra.fcmMessageId }),
        ...(extra?.sentAt && { sentAt: extra.sentAt }),
        ...(extra?.errorCode && { errorCode: extra.errorCode }),
        ...(extra?.errorMessage && { errorMessage: extra.errorMessage }),
      },
    })
  }

  async updateHistoryBatchStatus(historyIds: number[], status: NotificationHistoryStatus): Promise<void> {
    await this.prisma.push_notification_history.updateMany({
      where: { id: { in: historyIds } },
      data: { status },
    })
  }

  async getHistoriesByBatchId(batchId: number): Promise<PushNotificationHistory[]> {
    const entities = await this.prisma.push_notification_history.findMany({
      where: { batchId },
    })
    return entities.map(mapPushNotificationHistory)
  }

  async getHistoriesByUserId(userId: number, cursor?: number, limit: number = 20): Promise<PushNotificationHistory[]> {
    const entities = await this.prisma.push_notification_history.findMany({
      where: {
        userId,
        status: { in: ['SENT', 'DELIVERED'] },
        ...(cursor ? { id: { lt: cursor } } : {}),
      },
      orderBy: { id: 'desc' },
      take: limit,
    })
    return entities.map(mapPushNotificationHistory)
  }

  async markHistoryAsRead(historyId: number, userId: number): Promise<void> {
    await this.prisma.push_notification_history.updateMany({
      where: { id: historyId, userId },
      data: { readAt: new Date() },
    })
  }

  // --- Agreement management ---

  async getAgreement(userId: number): Promise<UserPushAgreement | null> {
    const entity = await this.prisma.user_push_agreement.findUnique({ where: { userId } })
    return entity ? mapUserPushAgreement(entity) : null
  }

  async upsertAgreement(
    userId: number,
    data: Partial<Pick<UserPushAgreement, 'info' | 'marketing' | 'nightMarketing' | 'detail' | 'detailVersion'>>,
  ): Promise<UserPushAgreement> {
    const detailCreate = data.detail === undefined
      ? undefined
      : data.detail === null
        ? Prisma.JsonNull
        : (data.detail as Prisma.InputJsonValue)
    const detailUpdate = data.detail === undefined
      ? undefined
      : data.detail === null
        ? Prisma.JsonNull
        : (data.detail as Prisma.InputJsonValue)

    const entity = await this.prisma.user_push_agreement.upsert({
      where: { userId },
      create: {
        userId,
        info: data.info ?? true,
        marketing: data.marketing ?? false,
        nightMarketing: data.nightMarketing ?? false,
        detailVersion: data.detailVersion ?? 1,
        detail: detailCreate,
      },
      update: {
        ...(data.info !== undefined && { info: data.info }),
        ...(data.marketing !== undefined && { marketing: data.marketing }),
        ...(data.nightMarketing !== undefined && { nightMarketing: data.nightMarketing }),
        ...(detailUpdate !== undefined && { detail: detailUpdate }),
        ...(data.detailVersion !== undefined && { detailVersion: data.detailVersion }),
      },
    })
    return mapUserPushAgreement(entity)
  }

  async getAgreedUserIds(type: string): Promise<number[]> {
    let whereClause: Record<string, boolean>
    switch (type) {
      case 'INFO':
        whereClause = { info: true }
        break
      case 'MARKETING':
        whereClause = { marketing: true }
        break
      case 'NIGHT_MARKETING':
        whereClause = { nightMarketing: true }
        break
      default:
        whereClause = { info: true }
    }

    const agreements = await this.prisma.user_push_agreement.findMany({
      where: whereClause,
      select: { userId: true },
    })
    return agreements.map((a) => a.userId)
  }
}
