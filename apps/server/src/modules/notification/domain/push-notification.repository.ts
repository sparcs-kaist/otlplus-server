import {
  PushNotification,
  PushNotificationBatch,
  PushNotificationHistory,
  UserPushAgreement,
} from './push-notification.domain'
import { NotificationHistoryStatus } from './push-notification.enums'

export const PUSH_NOTIFICATION_REPOSITORY = Symbol('PUSH_NOTIFICATION_REPOSITORY')

export interface PushNotificationRepository {
  // --- PushNotification CRUD ---
  create(data: Omit<PushNotification, 'id' | 'createdAt' | 'updatedAt'>): Promise<PushNotification>
  update(id: number, data: Partial<Omit<PushNotification, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PushNotification>
  delete(id: number): Promise<void>
  findById(id: number): Promise<PushNotification | null>
  findAll(): Promise<PushNotification[]>
  findByName(name: string): Promise<PushNotification | null>

  // --- Schedule queries ---
  findDueOneTimeNotifications(now: Date): Promise<PushNotification[]>
  findActiveCronNotifications(): Promise<PushNotification[]>

  // --- Batch management ---
  createBatch(data: Omit<PushNotificationBatch, 'id' | 'createdAt'>): Promise<PushNotificationBatch>
  updateBatchCounts(batchId: string, sentCount: number, failedCount: number): Promise<void>
  completeBatch(batchId: string): Promise<void>
  findBatchByBatchId(batchId: string): Promise<PushNotificationBatch | null>
  findLatestBatchByNotificationId(notificationId: number): Promise<PushNotificationBatch | null>
  updateBatchStatus(batchId: string, status: string): Promise<void>

  // --- History management ---
  createHistoryBatch(histories: Omit<PushNotificationHistory, 'id' | 'createdAt'>[]): Promise<number[]>
  updateHistoryStatus(
    historyId: number,
    status: NotificationHistoryStatus,
    extra?: { fcmMessageId?: string, sentAt?: Date, errorCode?: string, errorMessage?: string },
  ): Promise<void>
  updateHistoryBatchStatus(historyIds: number[], status: NotificationHistoryStatus): Promise<void>
  getHistoriesByBatchId(batchId: number): Promise<PushNotificationHistory[]>
  getHistoriesByUserId(userId: number, cursor?: number, limit?: number): Promise<PushNotificationHistory[]>
  markHistoryAsRead(historyId: number, userId: number): Promise<void>

  // --- Agreement management ---
  getAgreement(userId: number): Promise<UserPushAgreement | null>
  upsertAgreement(
    userId: number,
    data: Partial<Pick<UserPushAgreement, 'info' | 'marketing' | 'nightMarketing' | 'detail' | 'detailVersion'>>,
  ): Promise<UserPushAgreement>
  getAgreedUserIds(type: string): Promise<number[]>
}
