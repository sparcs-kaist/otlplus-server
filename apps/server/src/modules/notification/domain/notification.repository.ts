import { UserNotification, UserNotificationCreate } from '@otl/server-nest/modules/notification/domain/notification'

import { NotificationType } from '@otl/common/enum/notification'

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY')
export interface NotificationRepository {
  // get All Notification
  getAllNotification(): Promise<Notification[]>

  // get Notification By Type
  getNotification(type: NotificationType): Promise<Notification>

  findById(id: number): Promise<UserNotification | null>

  findByUserId(userId: number): Promise<UserNotification[] | null>

  findByUserIdAndType(userId: number, type: NotificationType): Promise<UserNotification | null>

  // bulk update
  updateMany(notifications: UserNotification[]): Promise<UserNotification[]>

  // bulk create
  createMany(notifications: UserNotificationCreate[]): Promise<UserNotification[]>

  // create and update
  save(notification: UserNotificationCreate): Promise<UserNotification>
  save(notification: UserNotification): Promise<UserNotification>
  save(notification: UserNotificationCreate | UserNotification): Promise<UserNotification>

  // upsert
  upsert(notification: UserNotificationCreate): Promise<UserNotification>
  upsertMany(notifications: UserNotificationCreate[]): Promise<UserNotificationCreate>
}
