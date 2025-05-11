import { FCMNotificationRequest } from '@otl/server-nest/modules/notification/domain/notification'

import { NotificationType } from '@otl/common/enum/notification'
import { _UserNotification } from '@otl/common/notification/notification'
import { _NotificationPort } from '@otl/common/notification/notification.port'

export interface NotificationInPrivatePort extends _NotificationPort {
  // 알림 수신 동의 여부 변경
  changeNotificationPermission(
    userId: number,
    notificationType: NotificationType,
    Active: boolean,
  ): Promise<_UserNotification>

  readNotification(userId: number, requestId: number): Promise<FCMNotificationRequest>
}
