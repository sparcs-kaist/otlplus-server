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

import { AgreementType } from '@otl/common/enum/agreement'

import {
  EPushNotification,
  EPushNotificationBatch,
  EPushNotificationHistory,
  EUserPushAgreement,
} from '@otl/prisma-client/entities/EPushNotification'

export function mapPushNotification(entity: EPushNotification.Basic): PushNotification {
  return {
    id: entity.id,
    name: entity.name,
    type: entity.type as AgreementType,
    titleTemplate: entity.titleTemplate,
    bodyTemplate: entity.bodyTemplate,
    targetType: entity.targetType as NotificationTargetType,
    targetFilter: entity.targetFilter as TargetFilter | null,
    scheduleType: entity.scheduleType as NotificationScheduleType,
    scheduleAt: entity.scheduleAt,
    cronExpression: entity.cronExpression,
    priority: entity.priority as NotificationPriority,
    digestKey: entity.digestKey,
    digestWindowSec: entity.digestWindowSec,
    isActive: entity.isActive,
    createdBy: entity.createdBy,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  }
}

export function mapPushNotificationBatch(entity: EPushNotificationBatch.Basic): PushNotificationBatch {
  return {
    id: entity.id,
    notificationId: entity.notificationId,
    batchId: entity.batchId,
    totalCount: entity.totalCount,
    sentCount: entity.sentCount,
    failedCount: entity.failedCount,
    status: entity.status as BatchStatus,
    startedAt: entity.startedAt,
    completedAt: entity.completedAt,
    createdAt: entity.createdAt,
  }
}

export function mapPushNotificationHistory(entity: EPushNotificationHistory.Basic): PushNotificationHistory {
  return {
    id: entity.id,
    batchId: entity.batchId,
    notificationId: entity.notificationId,
    userId: entity.userId,
    deviceId: entity.deviceId,
    fcmToken: entity.fcmToken,
    notificationType: entity.notificationType as AgreementType,
    priority: entity.priority as NotificationPriority,
    title: entity.title,
    body: entity.body,
    status: entity.status as NotificationHistoryStatus,
    fcmMessageId: entity.fcmMessageId,
    errorCode: entity.errorCode,
    errorMessage: entity.errorMessage,
    idempotencyKey: entity.idempotencyKey,
    queuedAt: entity.queuedAt,
    sentAt: entity.sentAt,
    deliveredAt: entity.deliveredAt,
    readAt: entity.readAt,
    createdAt: entity.createdAt,
  }
}

export function mapUserPushAgreement(entity: EUserPushAgreement.Basic): UserPushAgreement {
  return {
    userId: entity.userId,
    info: entity.info,
    marketing: entity.marketing,
    nightMarketing: entity.nightMarketing,
    detailVersion: entity.detailVersion,
    detail: entity.detail as Record<string, boolean> | null,
    agreedAt: entity.agreedAt,
    updatedAt: entity.updatedAt,
  }
}
