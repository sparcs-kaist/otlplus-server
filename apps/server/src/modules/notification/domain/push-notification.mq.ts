import { NotificationPriority } from './push-notification.enums'
import { BatchNotificationMessage } from './push-notification.message'

export const PUSH_NOTIFICATION_MQ = Symbol('PUSH_NOTIFICATION_MQ')

export interface PushNotificationMq {
  publishBatch(msg: BatchNotificationMessage, priority: NotificationPriority): Promise<boolean>
}
