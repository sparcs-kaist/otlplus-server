import { Notification, NotificationRequest } from '@otl/server-nest/modules/notification/domain/notification'

export interface NotificationInPublicPort {
  // 알림 전송
  sendNotification(
    to: string,
    title: string,
    body: string,
    metadata: { userId: number, scheduleAt: Date, notificationName: string },
  ): Promise<NotificationRequest>

  // 모두에게 알림 전송
  sendNotificationToAll(title: string, body: string): Promise<NotificationRequest[]>

  // 알림 전송 가져오기
  getNotificationRequest(uuid: string): Promise<NotificationRequest>

  // 알림 전송 여부 확인
  checkNotificationCompleted(uuid: string): Promise<NotificationRequest | null>

  // 알림 수신 동의 여부 & 약관 동의
  checkNotificationPermission(userId: number, notificationType: string): Promise<boolean>

  getNotification(name: string): Promise<Notification | null>
}
