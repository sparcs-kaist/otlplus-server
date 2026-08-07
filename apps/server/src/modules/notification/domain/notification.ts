import { AgreementType } from '@otl/common/enum/agreement'

export class Notification {
  public static templatePath: string = 'notification'

  id!: number

  name!: string

  description!: string

  agreementType!: AgreementType
}

export class UserNotification {
  id!: number

  userId!: number

  notificationName!: string

  active!: boolean
}

export class NotificationRequest {
  id!: number | null

  notificationName!: string

  userId!: number

  content!: { title: string, body: string }

  requestId!: string

  scheduleAt!: Date

  isCompleted!: boolean

  isRead!: boolean
}

export class FCMNotificationRequest extends NotificationRequest {
  fcmId?: string

  deviceToken!: string
}

export class EmailNotificationRequest extends NotificationRequest {
  email!: string
}

export type UserNotificationCreate = Omit<UserNotification, 'id'>

export type NotificationRequestCreate = Omit<NotificationRequest, 'id'>

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
