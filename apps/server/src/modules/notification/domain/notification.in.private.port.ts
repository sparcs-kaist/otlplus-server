import {
  FCMNotificationRequest,
  Notification,
  UserNotification,
} from '@otl/server-nest/modules/notification/domain/notification'

import { AgreementType } from '@otl/common/enum/agreement'

export interface NotificationInPrivatePort {
  // 알림 수신 동의 여부 변경
  changeNotificationPermission(userId: number, notificationName: string, Active: boolean): Promise<UserNotification>

  readNotification(userId: number, requestId: number): Promise<FCMNotificationRequest>

  createNotification(name: string, description: string, agreementType: AgreementType): Promise<Notification>

  updateNotification(id: number, name: string, description: string, agreementType: AgreementType): Promise<Notification>
  deleteNotification(id: number): Promise<void>

  getAllNotification(): Promise<Notification[]>

  getNotificationByName(name: string): Promise<Notification>
}
