import { Injectable } from '@nestjs/common'
import { NotificationHistoryStatus } from '@otl/server-nest/modules/notification/domain/push-notification.enums'

import { PrismaService } from '@otl/prisma-client/prisma.service'

export const PUSH_NOTIFICATION_HISTORY_REPOSITORY = Symbol('PUSH_NOTIFICATION_HISTORY_REPOSITORY')

export interface ConsumerPushNotificationHistoryRepository {
  updateStatus(
    historyId: number,
    status: NotificationHistoryStatus,
    extra?: { fcmMessageId?: string, sentAt?: Date, errorCode?: string, errorMessage?: string },
  ): Promise<void>

  updateBatchStatus(historyIds: number[], status: NotificationHistoryStatus): Promise<void>

  updateBatchCounts(batchId: string, sentCount: number, failedCount: number): Promise<void>

  completeBatch(batchId: string): Promise<void>
}

@Injectable()
export class ConsumerPushNotificationHistoryPrismaRepository implements ConsumerPushNotificationHistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async updateStatus(
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

  async updateBatchStatus(historyIds: number[], status: NotificationHistoryStatus): Promise<void> {
    await this.prisma.push_notification_history.updateMany({
      where: { id: { in: historyIds } },
      data: { status },
    })
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
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    })
  }
}
