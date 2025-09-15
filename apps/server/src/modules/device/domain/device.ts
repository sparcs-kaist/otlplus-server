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
