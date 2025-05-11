import { NotificationType } from '@otl/common/enum/notification'
import { _NotificationRequest } from '@otl/common/notification/notification'

export interface _NotificationPort {
  // 알림 전송
  sendNotification(
    to: string,
    title: string,
    body: string,
    metadata: { userId: number, scheduleAt: Date, notificationType: NotificationType },
  ): Promise<_NotificationRequest>

  // 모두에게 알림 전송
  sendNotificationToAll(title: string, body: string): Promise<_NotificationRequest[]>

  // 알림 전송 가져오기
  getNotificationRequest(uuid: string): Promise<_NotificationRequest>

  // 알림 전송 여부 확인
  checkNotificationCompleted(uuid: string): Promise<_NotificationRequest | null>

  // 알림 수신 동의 여부 & 약관 동의
  checkNotificationPermission(userId: number, notificationType: NotificationType): Promise<boolean>
}
