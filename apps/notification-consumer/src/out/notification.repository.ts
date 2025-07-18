import {
  FCMNotificationRequest,
  Notification,
  NotificationRequestCreate,
} from '@otl/server-nest/modules/notification/domain/notification'

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY')
export interface ConsumerNotificationRepository {
  // get All Notification
  getAllNotification(): Promise<Notification[]>

  // get Notification By Type
  getNotification(name: string): Promise<Notification>

  // create and update
  saveRequest(notification: NotificationRequestCreate): Promise<FCMNotificationRequest>
  saveRequest(notification: FCMNotificationRequest): Promise<FCMNotificationRequest>
  saveRequest(notification: NotificationRequestCreate | FCMNotificationRequest): Promise<FCMNotificationRequest>
}
