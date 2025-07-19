import { FCMNotificationRequest } from '@otl/server-nest/modules/notification/domain/notification'

export const NOTIFICATION_MQ = Symbol('NOTIFICATION_MQ')
export interface NotificationMq {
  publishNotification(request: FCMNotificationRequest): Promise<boolean>
}
