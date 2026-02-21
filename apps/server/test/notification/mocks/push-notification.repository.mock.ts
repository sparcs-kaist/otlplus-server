import {
  PushNotification,
  PushNotificationBatch,
  PushNotificationHistory,
  UserPushAgreement,
} from '@otl/server-nest/modules/notification/domain/push-notification.domain'
import { PushNotificationRepository } from '@otl/server-nest/modules/notification/domain/push-notification.repository'
import { NotificationHistoryStatus } from '@otl/server-nest/modules/notification/domain/push-notification.enums'

export class MockPushNotificationRepository implements PushNotificationRepository {
  private notifications: PushNotification[] = []
  private batches: PushNotificationBatch[] = []
  private histories: PushNotificationHistory[] = []
  private agreements: UserPushAgreement[] = []
  private idCounter = 1
  private batchIdCounter = 1
  private historyIdCounter = 1
  private existingIdempotencyKeys = new Set<string>()

  // --- PushNotification CRUD ---
  async create(data: Omit<PushNotification, 'id' | 'createdAt' | 'updatedAt'>): Promise<PushNotification> {
    const notification = {
      ...data,
      id: this.idCounter++,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as PushNotification
    this.notifications.push(notification)
    return notification
  }

  async update(
    id: number,
    data: Partial<Omit<PushNotification, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<PushNotification> {
    const index = this.notifications.findIndex((n) => n.id === id)
    if (index === -1) throw new Error('Notification not found')

    this.notifications[index] = {
      ...this.notifications[index],
      ...data,
      updatedAt: new Date(),
    }
    return this.notifications[index]
  }

  async delete(id: number): Promise<void> {
    const index = this.notifications.findIndex((n) => n.id === id)
    if (index !== -1) {
      this.notifications.splice(index, 1)
    }
  }

  async findById(id: number): Promise<PushNotification | null> {
    return this.notifications.find((n) => n.id === id) || null
  }

  async findAll(): Promise<PushNotification[]> {
    return [...this.notifications].sort((a, b) => b.id - a.id)
  }

  async findByName(name: string): Promise<PushNotification | null> {
    return this.notifications.find((n) => n.name === name) || null
  }

  // --- Schedule queries ---
  async findDueOneTimeNotifications(now: Date): Promise<PushNotification[]> {
    return this.notifications.filter(
      (n) => n.isActive && n.scheduleType === 'ONE_TIME' && n.scheduleAt !== null && n.scheduleAt <= now,
    )
  }

  async findActiveCronNotifications(): Promise<PushNotification[]> {
    return this.notifications.filter((n) => n.isActive && n.scheduleType === 'CRON')
  }

  // --- Batch management ---
  async createBatch(data: Omit<PushNotificationBatch, 'id' | 'createdAt'>): Promise<PushNotificationBatch> {
    const batch = {
      ...data,
      id: this.batchIdCounter++,
      createdAt: new Date(),
    } as PushNotificationBatch
    this.batches.push(batch)
    return batch
  }

  async updateBatchCounts(batchId: string, sentCount: number, failedCount: number): Promise<void> {
    const batch = this.batches.find((b) => b.batchId === batchId)
    if (batch) {
      batch.sentCount += sentCount
      batch.failedCount += failedCount
    }
  }

  async completeBatch(batchId: string): Promise<void> {
    const batch = this.batches.find((b) => b.batchId === batchId)
    if (batch) {
      batch.status = 'COMPLETED'
      batch.completedAt = new Date()
    }
  }

  async findBatchByBatchId(batchId: string): Promise<PushNotificationBatch | null> {
    return this.batches.find((b) => b.batchId === batchId) || null
  }

  async findLatestBatchByNotificationId(notificationId: number): Promise<PushNotificationBatch | null> {
    const batches = this.batches.filter((b) => b.notificationId === notificationId).sort((a, b) => b.id - a.id)
    return batches[0] || null
  }

  async updateBatchStatus(batchId: string, status: string): Promise<void> {
    const batch = this.batches.find((b) => b.batchId === batchId)
    if (batch) {
      batch.status = status as any
      if (status === 'PROCESSING') {
        batch.startedAt = new Date()
      }
    }
  }

  // --- History management ---
  async createHistoryBatch(histories: Omit<PushNotificationHistory, 'id' | 'createdAt'>[]): Promise<number[]> {
    const ids: number[] = []

    for (const historyData of histories) {
      // Check idempotency
      if (this.existingIdempotencyKeys.has(historyData.idempotencyKey)) {
        continue // Skip duplicate
      }

      const history = {
        ...historyData,
        id: this.historyIdCounter++,
        createdAt: new Date(),
      } as PushNotificationHistory

      this.histories.push(history)
      this.existingIdempotencyKeys.add(historyData.idempotencyKey)
      ids.push(history.id)
    }

    return ids
  }

  async updateHistoryStatus(
    historyId: number,
    status: NotificationHistoryStatus,
    extra?: { fcmMessageId?: string; sentAt?: Date; errorCode?: string; errorMessage?: string },
  ): Promise<void> {
    const history = this.histories.find((h) => h.id === historyId)
    if (history) {
      history.status = status
      if (extra?.fcmMessageId) history.fcmMessageId = extra.fcmMessageId
      if (extra?.sentAt) history.sentAt = extra.sentAt
      if (extra?.errorCode) history.errorCode = extra.errorCode
      if (extra?.errorMessage) history.errorMessage = extra.errorMessage
    }
  }

  async updateHistoryBatchStatus(historyIds: number[], status: NotificationHistoryStatus): Promise<void> {
    for (const id of historyIds) {
      const history = this.histories.find((h) => h.id === id)
      if (history) {
        history.status = status
      }
    }
  }

  async getHistoriesByBatchId(batchId: number): Promise<PushNotificationHistory[]> {
    return this.histories.filter((h) => h.batchId === batchId)
  }

  async getHistoriesByUserId(userId: number, cursor?: number, limit: number = 20): Promise<PushNotificationHistory[]> {
    let filtered = this.histories.filter((h) => h.userId === userId).sort((a, b) => b.id - a.id)

    if (cursor !== undefined) {
      filtered = filtered.filter((h) => h.id < cursor)
    }

    return filtered.slice(0, limit)
  }

  async markHistoryAsRead(historyId: number, userId: number): Promise<void> {
    const history = this.histories.find((h) => h.id === historyId && h.userId === userId)
    if (history) {
      history.readAt = new Date()
    }
  }

  // --- Agreement management ---
  async getAgreement(userId: number): Promise<UserPushAgreement | null> {
    return this.agreements.find((a) => a.userId === userId) || null
  }

  async upsertAgreement(
    userId: number,
    data: Partial<Pick<UserPushAgreement, 'info' | 'marketing' | 'nightMarketing' | 'detail' | 'detailVersion'>>,
  ): Promise<UserPushAgreement> {
    const existing = this.agreements.find((a) => a.userId === userId)

    if (existing) {
      Object.assign(existing, data, { updatedAt: new Date() })
      return existing
    } else {
      const agreement = {
        userId,
        info: data.info ?? true,
        marketing: data.marketing ?? false,
        nightMarketing: data.nightMarketing ?? false,
        detailVersion: data.detailVersion ?? 0,
        detail: data.detail ?? null,
        agreedAt: new Date(),
        updatedAt: new Date(),
      } as UserPushAgreement
      this.agreements.push(agreement)
      return agreement
    }
  }

  async getAgreedUserIds(type: string): Promise<number[]> {
    const field = type === 'INFO' ? 'info' : type === 'MARKETING' ? 'marketing' : 'nightMarketing'
    return this.agreements.filter((a) => a[field] === true).map((a) => a.userId)
  }

  // --- Helper methods for testing ---
  reset(): void {
    this.notifications = []
    this.batches = []
    this.histories = []
    this.agreements = []
    this.idCounter = 1
    this.batchIdCounter = 1
    this.historyIdCounter = 1
    this.existingIdempotencyKeys.clear()
  }

  seedNotifications(notifications: PushNotification[]): void {
    this.notifications.push(...notifications)
    const maxId = Math.max(...notifications.map((n) => n.id), 0)
    this.idCounter = maxId + 1
  }

  seedBatches(batches: PushNotificationBatch[]): void {
    this.batches.push(...batches)
    const maxId = Math.max(...batches.map((b) => b.id), 0)
    this.batchIdCounter = maxId + 1
  }

  seedHistories(histories: PushNotificationHistory[]): void {
    this.histories.push(...histories)
    histories.forEach((h) => this.existingIdempotencyKeys.add(h.idempotencyKey))
    const maxId = Math.max(...histories.map((h) => h.id), 0)
    this.historyIdCounter = maxId + 1
  }

  seedAgreements(agreements: UserPushAgreement[]): void {
    this.agreements.push(...agreements)
  }

  getNotifications(): PushNotification[] {
    return this.notifications
  }

  getBatches(): PushNotificationBatch[] {
    return this.batches
  }

  getHistories(): PushNotificationHistory[] {
    return this.histories
  }

  getAgreements(): UserPushAgreement[] {
    return this.agreements
  }
}
