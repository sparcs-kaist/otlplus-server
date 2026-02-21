import { AgreementType } from '@otl/common/enum/agreement'

import {
  PushNotification,
  PushNotificationBatch,
  PushNotificationHistory,
  UserPushAgreement,
} from './push-notification.domain'
import { NotificationPriority, NotificationScheduleType, NotificationTargetType } from './push-notification.enums'

export const PUSH_NOTIFICATION_IN_PORT = Symbol('PUSH_NOTIFICATION_IN_PORT')
export const PUSH_NOTIFICATION_PREFERENCE_PORT = Symbol('PUSH_NOTIFICATION_PREFERENCE_PORT')

export interface PushNotificationInPort {
  // Admin CRUD
  createPushNotification(data: {
    name: string
    type: AgreementType
    titleTemplate: string
    bodyTemplate: string
    targetType: NotificationTargetType
    targetFilter?: Record<string, unknown> | null
    scheduleType: NotificationScheduleType
    scheduleAt?: Date | null
    cronExpression?: string | null
    priority?: NotificationPriority
    digestKey?: string | null
    digestWindowSec?: number | null
    isActive?: boolean
    createdBy?: number | null
  }): Promise<PushNotification>

  updatePushNotification(
    id: number,
    data: Partial<{
      name: string
      type: AgreementType
      titleTemplate: string
      bodyTemplate: string
      targetType: NotificationTargetType
      targetFilter: Record<string, unknown> | null
      scheduleType: NotificationScheduleType
      scheduleAt: Date | null
      cronExpression: string | null
      priority: NotificationPriority
      digestKey: string | null
      digestWindowSec: number | null
      isActive: boolean
    }>,
  ): Promise<PushNotification>

  deletePushNotification(id: number): Promise<void>

  getPushNotification(id: number): Promise<PushNotification | null>

  listPushNotifications(): Promise<PushNotification[]>

  // Send
  sendNotificationNow(id: number, templateVars?: Record<string, string>): Promise<PushNotificationBatch>

  // Status
  getDeliveryStatus(id: number): Promise<{
    batch: PushNotificationBatch | null
    histories: PushNotificationHistory[]
  }>
}

export interface PushNotificationPreferencePort {
  getPreferences(userId: number): Promise<UserPushAgreement>
  updatePreferences(
    userId: number,
    data: Partial<Pick<UserPushAgreement, 'info' | 'marketing' | 'nightMarketing'>>,
  ): Promise<UserPushAgreement>
  updateDetailPreference(userId: number, notificationName: string, active: boolean): Promise<UserPushAgreement>
  getHistory(userId: number, cursor?: number, limit?: number): Promise<PushNotificationHistory[]>
  markAsRead(userId: number, historyId: number): Promise<void>
}
