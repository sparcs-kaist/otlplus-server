import { UserDevice } from '@otl/server-nest/modules/device/domain/device'

export interface DeviceInPrivatePort {
  // FCM Token 등록
  registerDevice(
    userId: number,
    deviceToken: string,
    deviceType?: string | null,
    deviceOsVersion?: string,
    appVersion?: string,
  ): Promise<UserDevice>

  // FCM Token 해제
  unregisterDevice(userId: number, deviceToken: string): Promise<void>

  // 기기 알림 On
  makeDeviceTokenActive(userId: number, deviceToken: string): Promise<UserDevice>

  // 기기 알림 Off
  makeDeviceTokenInactive(userId: number, deviceToken: string): Promise<UserDevice>

  // // 알림 수신 동의 여부 변경
  // changeNotificationPermission(userId: number, notificationId: number, Active: boolean): Promise<UserNotification>
}
