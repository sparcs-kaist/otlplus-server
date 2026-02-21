import { AgreementType } from '@otl/common/enum/agreement'

import {
  BatchStatus,
  NotificationHistoryStatus,
  NotificationPriority,
  NotificationScheduleType,
  NotificationTargetType,
} from './push-notification.enums'

export class PushNotification {
  id!: number

  name!: string

  type!: AgreementType

  titleTemplate!: string

  bodyTemplate!: string

  targetType!: NotificationTargetType

  targetFilter!: TargetFilter | null

  scheduleType!: NotificationScheduleType

  scheduleAt!: Date | null

  cronExpression!: string | null

  priority!: NotificationPriority

  digestKey!: string | null

  digestWindowSec!: number | null

  isActive!: boolean

  createdBy!: number | null

  createdAt!: Date

  updatedAt!: Date
}

export class PushNotificationBatch {
  id!: number

  notificationId!: number

  batchId!: string

  totalCount!: number

  sentCount!: number

  failedCount!: number

  status!: BatchStatus

  startedAt!: Date | null

  completedAt!: Date | null

  createdAt!: Date
}

export class PushNotificationHistory {
  id!: number

  batchId!: number

  notificationId!: number

  userId!: number

  deviceId!: number | null

  fcmToken!: string | null

  notificationType!: AgreementType

  priority!: NotificationPriority

  title!: string

  body!: string

  status!: NotificationHistoryStatus

  fcmMessageId!: string | null

  errorCode!: string | null

  errorMessage!: string | null

  idempotencyKey!: string

  queuedAt!: Date

  sentAt!: Date | null

  deliveredAt!: Date | null

  readAt!: Date | null

  createdAt!: Date
}

export class UserPushAgreement {
  userId!: number

  info!: boolean

  marketing!: boolean

  nightMarketing!: boolean

  detailVersion!: number

  detail!: Record<string, boolean> | null

  agreedAt!: Date

  updatedAt!: Date
}

export interface TargetFilter {
  userIds?: number[]
  departmentIds?: number[]
  majorIds?: number[]
  yearJoinedAfter?: number
  yearJoinedBefore?: number
}
