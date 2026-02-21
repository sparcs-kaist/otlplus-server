import { Inject, Injectable } from '@nestjs/common'
import {
  PushNotificationHistory,
  UserPushAgreement,
} from '@otl/server-nest/modules/notification/domain/push-notification.domain'
import { PushNotificationPreferencePort } from '@otl/server-nest/modules/notification/domain/push-notification.in.port'
import {
  PUSH_NOTIFICATION_REPOSITORY,
  PushNotificationRepository,
} from '@otl/server-nest/modules/notification/domain/push-notification.repository'

@Injectable()
export class PushNotificationPreferenceService implements PushNotificationPreferencePort {
  constructor(
    @Inject(PUSH_NOTIFICATION_REPOSITORY)
    private readonly repo: PushNotificationRepository,
  ) {}

  async getPreferences(userId: number): Promise<UserPushAgreement> {
    const agreement = await this.repo.getAgreement(userId)
    if (agreement) return agreement

    // Create default preferences
    return this.repo.upsertAgreement(userId, {
      info: true,
      marketing: false,
      nightMarketing: false,
    })
  }

  async updatePreferences(
    userId: number,
    data: Partial<Pick<UserPushAgreement, 'info' | 'marketing' | 'nightMarketing'>>,
  ): Promise<UserPushAgreement> {
    return this.repo.upsertAgreement(userId, data)
  }

  async updateDetailPreference(userId: number, notificationName: string, active: boolean): Promise<UserPushAgreement> {
    const existing = await this.getPreferences(userId)
    const detail = (existing.detail ?? {}) as Record<string, boolean>
    detail[notificationName] = active

    return this.repo.upsertAgreement(userId, {
      detail,
      detailVersion: existing.detailVersion + 1,
    })
  }

  async getHistory(userId: number, cursor?: number, limit?: number): Promise<PushNotificationHistory[]> {
    return this.repo.getHistoriesByUserId(userId, cursor, limit ?? 20)
  }

  async markAsRead(userId: number, historyId: number): Promise<void> {
    return this.repo.markHistoryAsRead(historyId, userId)
  }
}
