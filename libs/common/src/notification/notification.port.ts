import { _NotificationRequest, _UserNotification } from '@otl/common/notification/notification'

export interface _NotificationPort {
  // 알림 전송
  sendNotification(deviceToken: string, title: string, body: string): Promise<_NotificationRequest>

  // 모두에게 알림 전송
  sendNotificationToAll(title: string, body: string): Promise<_NotificationRequest[]>

  // 알림 전송 여부 확인
  checkNotificationCompleted(userId: number, notificationRequestId: number): Promise<_NotificationRequest>

  // 알림 수신 동의 여부 & 약관 동의
  checkNotificationPermission(userId: number, notificationId: number): Promise<_UserNotification>

  // 알림 수신 동의 여부 변경
  changeNotificationPermission(userId: number, notificationId: number, Active: boolean): Promise<_UserNotification>
}
