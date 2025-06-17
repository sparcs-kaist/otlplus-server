import { FCMNotificationRequest, Notification } from '@otl/server-nest/modules/notification/domain/notification'

import { AgreementType } from '@otl/common/enum/agreement'
import { _UserNotification } from '@otl/common/notification/notification'
import { _NotificationPort } from '@otl/common/notification/notification.port'

export interface NotificationInPrivatePort extends _NotificationPort {
  // 알림 수신 동의 여부 변경
  changeNotificationPermission(userId: number, notificationName: string, Active: boolean): Promise<_UserNotification>

  readNotification(userId: number, requestId: number): Promise<FCMNotificationRequest>

  createNotification(name: string, description: string, agreementType: AgreementType): Promise<Notification>

  updateNotification(id: number, name: string, description: string, agreementType: AgreementType): Promise<Notification>
  deleteNotification(id: number): Promise<void>

  getAllNotification(): Promise<Notification[]>

  getNotificationByName(name: string): Promise<Notification>
}
