import { _Notification, _NotificationRequest, _UserNotification } from '@otl/common/notification/notification'

export class Notification extends _Notification {}

export class UserNotification extends _UserNotification {}

export class NotificationRequest extends _NotificationRequest {}

export type UserNotificationCreate = Omit<UserNotification, 'id'>
