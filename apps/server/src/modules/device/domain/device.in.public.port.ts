import { NotificationRequest, UserDevice, UserNotification } from '@otl/server-nest/modules/device/domain/device'

export interface DeviceInPublicPort {
  // User의 FCM Token 조회
  getDeviceToken(userId: number): Promise<UserDevice[]>

  // 이미 등록된 Device 인지 확인
  checkExistDevice(deviceToken: string): Promise<UserDevice | null>

  // 알림 전송
  sendNotification(deviceToken: string, title: string, body: string): Promise<NotificationRequest>

  // 모두에게 알림 전송
  sendNotificationToAll(title: string, body: string): Promise<NotificationRequest[]>

  // 알림 전송 여부 확인
  checkNotificationCompleted(userId: number, notificationRequestId: number): Promise<NotificationRequest>

  // 알림 수신 동의 여부 & 약관 동의
  checkNotificationPermission(userId: number, notificationId: number): Promise<UserNotification>
}
