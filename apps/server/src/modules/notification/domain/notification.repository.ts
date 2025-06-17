import {
  FCMNotificationRequest,
  Notification,
  NotificationRequestCreate,
  UserNotification,
  UserNotificationCreate,
} from '@otl/server-nest/modules/notification/domain/notification'

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY')
export interface NotificationRepository {
  // get All Notification
  getAllNotification(): Promise<Notification[]>

  // get Notification By Type
  getNotification(name: string): Promise<Notification>

  // get by Id
  findById(id: number): Promise<UserNotification | null>

  // get by userId
  findByUserId(userId: number): Promise<UserNotification[] | null>

  // get by userId and notificationType
  findByUserIdAndType(userId: number, name: string): Promise<UserNotification | null>

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
  upsertMany(notifications: UserNotificationCreate[]): Promise<UserNotification[]>

  // get notificationRequest with requestID(uuid)
  getNotificationRequest(uuid: string): Promise<FCMNotificationRequest | null>
  getNotificationRequestById(requestId: number): Promise<FCMNotificationRequest>

  // create and update
  saveRequest(notification: NotificationRequestCreate): Promise<FCMNotificationRequest>
  saveRequest(notification: FCMNotificationRequest): Promise<FCMNotificationRequest>
  saveRequest(notification: NotificationRequestCreate | FCMNotificationRequest): Promise<FCMNotificationRequest>

  createNotification(notification: Notification): Promise<Notification>

  deleteNotification(id: number): Promise<void>

  updateNotification(notification: Notification): Promise<Notification>
}
