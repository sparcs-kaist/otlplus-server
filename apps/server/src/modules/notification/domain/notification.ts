import { _Notification, _NotificationRequest, _UserNotification } from '@otl/common/notification/notification'

export class Notification extends _Notification {}

export class UserNotification extends _UserNotification {}

export class FCMNotificationRequest extends _NotificationRequest {
  fcmId?: string

  deviceToken!: string
}

export class EmailNotificationRequest extends _NotificationRequest {
  email!: string
}

export type UserNotificationCreate = Omit<UserNotification, 'id'>

export type NotificationRequestCreate = Omit<_NotificationRequest, 'id'>

export function isFCMRequest(
  req: NotificationRequestCreate | FCMNotificationRequest | EmailNotificationRequest,
): req is FCMNotificationRequest {
  return 'deviceToken' in req
}

export function isEmailRequest(
  req: NotificationRequestCreate | FCMNotificationRequest | EmailNotificationRequest,
): req is EmailNotificationRequest {
  return 'email' in req
}
