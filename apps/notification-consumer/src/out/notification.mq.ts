import { FCMNotificationRequest } from '@otl/server-nest/modules/notification/domain/notification'

export const NOTIFICATION_MQ = Symbol('NOTIFICATION_MQ')
export interface NotificationConsumerMQ {
  publishInfoNotification(request: FCMNotificationRequest): Promise<boolean>

  publishAdNotification(request: FCMNotificationRequest): Promise<boolean>

  publishNightAdNotification(request: FCMNotificationRequest): Promise<boolean>
}
