import { Notification } from '@otl/server-nest/modules/notification/domain/notification'

import { _NotificationPort } from '@otl/common/notification/notification.port'

export interface NotificationInPublicPort extends _NotificationPort {
  getNotification(name: string): Promise<Notification | null>
}
