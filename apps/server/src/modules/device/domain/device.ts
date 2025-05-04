import { AgreementType } from '@otl/server-nest/modules/agreement/domain/UserAgreement'

export const NotificationType = {
  APP_UPDATE: 'APP_UPDATE',
  APP_UPDATE_FORCE: 'APP_UPDATE_FORCE',
} as const

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]

export class Device {
  public static templatePath: string = 'notification'

  id!: number

  name!: NotificationType

  agreementType!: AgreementType
}

export class UserNotification {
  id!: number

  userId!: number

  notificationId!: number

  active!: boolean
}

export class NotificationRequest {
  notificationId!: number

  userId!: number

  content!: string

  requestId!: string

  scheduleAt!: Date

  isCompleted!: boolean

  isRead!: boolean
}

export const DeviceType = {
  ANDROID: 'ANDROID',
  IOS: 'IOS',
  WEB: 'WEB',
} as const
export type DeviceType = (typeof DeviceType)[keyof typeof DeviceType]

export class UserDevice {
  id!: number

  userId!: number

  deviceToken!: string

  isActive!: boolean

  deviceType?: DeviceType | null

  deviceOsVersion?: string | null

  appVersion?: string | null
}
export type UserDeviceCreate = Omit<UserDevice, 'id'>
