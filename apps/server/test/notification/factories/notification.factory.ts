import { AgreementType } from '@otl/common/enum/agreement'
import {
  PushNotification,
  PushNotificationBatch,
  PushNotificationHistory,
  TargetFilter,
  UserPushAgreement,
} from '@otl/server-nest/modules/notification/domain/push-notification.domain'
import {
  BatchStatus,
  NotificationHistoryStatus,
  NotificationPriority,
  NotificationScheduleType,
  NotificationTargetType,
} from '@otl/server-nest/modules/notification/domain/push-notification.enums'
import { UserDevice } from '@otl/server-nest/modules/device/domain/device'
import { BatchNotificationMessage } from '@otl/server-nest/modules/notification/domain/push-notification.message'

let notificationIdCounter = 1
let batchIdCounter = 1
let historyIdCounter = 1
let deviceIdCounter = 1

export class NotificationFactory {
  static createPushNotification(overrides?: Partial<PushNotification>): PushNotification {
    const notification = new PushNotification()
    notification.id = overrides?.id ?? notificationIdCounter++
    notification.name = overrides?.name ?? `notification-${notification.id}`
    notification.type = overrides?.type ?? AgreementType.INFO
    notification.titleTemplate = overrides?.titleTemplate ?? 'Test Title'
    notification.bodyTemplate = overrides?.bodyTemplate ?? 'Test Body'
    notification.targetType = overrides?.targetType ?? NotificationTargetType.ALL
    notification.targetFilter = overrides?.targetFilter ?? null
    notification.scheduleType = overrides?.scheduleType ?? NotificationScheduleType.ONE_TIME
    notification.scheduleAt = overrides?.scheduleAt ?? null
    notification.cronExpression = overrides?.cronExpression ?? null
    notification.priority = overrides?.priority ?? NotificationPriority.NORMAL
    notification.digestKey = overrides?.digestKey ?? null
    notification.digestWindowSec = overrides?.digestWindowSec ?? null
    notification.isActive = overrides?.isActive ?? true
    notification.createdBy = overrides?.createdBy ?? 1
    notification.createdAt = overrides?.createdAt ?? new Date()
    notification.updatedAt = overrides?.updatedAt ?? new Date()
    return notification
  }

  static createBatch(overrides?: Partial<PushNotificationBatch>): PushNotificationBatch {
    const batch = new PushNotificationBatch()
    batch.id = overrides?.id ?? batchIdCounter++
    batch.notificationId = overrides?.notificationId ?? 1
    batch.batchId = overrides?.batchId ?? `batch-${batch.id}`
    batch.totalCount = overrides?.totalCount ?? 0
    batch.sentCount = overrides?.sentCount ?? 0
    batch.failedCount = overrides?.failedCount ?? 0
    batch.status = overrides?.status ?? BatchStatus.PENDING
    batch.startedAt = overrides?.startedAt ?? null
    batch.completedAt = overrides?.completedAt ?? null
    batch.createdAt = overrides?.createdAt ?? new Date()
    return batch
  }

  static createHistory(overrides?: Partial<PushNotificationHistory>): PushNotificationHistory {
    const history = new PushNotificationHistory()
    history.id = overrides?.id ?? historyIdCounter++
    history.batchId = overrides?.batchId ?? 1
    history.notificationId = overrides?.notificationId ?? 1
    history.userId = overrides?.userId ?? 1
    history.deviceId = overrides?.deviceId ?? null
    history.fcmToken = overrides?.fcmToken ?? null
    history.notificationType = overrides?.notificationType ?? AgreementType.INFO
    history.priority = overrides?.priority ?? NotificationPriority.NORMAL
    history.title = overrides?.title ?? 'Test Title'
    history.body = overrides?.body ?? 'Test Body'
    history.status = overrides?.status ?? NotificationHistoryStatus.QUEUED
    history.fcmMessageId = overrides?.fcmMessageId ?? null
    history.errorCode = overrides?.errorCode ?? null
    history.errorMessage = overrides?.errorMessage ?? null
    history.idempotencyKey = overrides?.idempotencyKey ?? `idem-${history.id}`
    history.queuedAt = overrides?.queuedAt ?? new Date()
    history.sentAt = overrides?.sentAt ?? null
    history.deliveredAt = overrides?.deliveredAt ?? null
    history.readAt = overrides?.readAt ?? null
    history.createdAt = overrides?.createdAt ?? new Date()
    return history
  }

  static createUserDevice(overrides?: Partial<UserDevice>): UserDevice {
    const device = new UserDevice()
    device.id = overrides?.id ?? deviceIdCounter++
    device.userId = overrides?.userId ?? 1
    device.deviceToken = overrides?.deviceToken ?? `token-${device.id}`
    device.deviceType = overrides?.deviceType ?? 'ANDROID'
    device.isActive = overrides?.isActive ?? true
    return device
  }

  static createAgreement(overrides?: Partial<UserPushAgreement>): UserPushAgreement {
    const agreement = new UserPushAgreement()
    agreement.userId = overrides?.userId ?? 1
    agreement.info = overrides?.info ?? true
    agreement.marketing = overrides?.marketing ?? true
    agreement.nightMarketing = overrides?.nightMarketing ?? false
    agreement.detailVersion = overrides?.detailVersion ?? 0
    agreement.detail = overrides?.detail ?? null
    agreement.agreedAt = overrides?.agreedAt ?? new Date()
    agreement.updatedAt = overrides?.updatedAt ?? new Date()
    return agreement
  }

  static createBatchMessage(overrides?: Partial<BatchNotificationMessage>): BatchNotificationMessage {
    return {
      batchId: overrides?.batchId ?? 'batch-1',
      notificationId: overrides?.notificationId ?? 1,
      type: overrides?.type ?? ('INFO' as any),
      priority: overrides?.priority ?? ('NORMAL' as any),
      title: overrides?.title ?? 'Test Title',
      body: overrides?.body ?? 'Test Body',
      data: overrides?.data ?? {},
      recipients: overrides?.recipients ?? [
        {
          userId: 1,
          fcmToken: 'token-1',
          historyId: 1,
          deviceId: 1,
        },
      ],
    }
  }

  static createTargetFilter(overrides?: Partial<TargetFilter>): TargetFilter {
    return {
      userIds: overrides?.userIds,
      departmentIds: overrides?.departmentIds,
      majorIds: overrides?.majorIds,
      yearJoinedAfter: overrides?.yearJoinedAfter,
      yearJoinedBefore: overrides?.yearJoinedBefore,
    }
  }

  static reset(): void {
    notificationIdCounter = 1
    batchIdCounter = 1
    historyIdCounter = 1
    deviceIdCounter = 1
  }
}
