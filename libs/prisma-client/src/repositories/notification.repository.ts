import { UserNotification, UserNotificationCreate } from '@otl/server-nest/modules/notification/domain/notification'
import { NotificationRepository } from '@otl/server-nest/modules/notification/domain/notification.repository'

import { NotificationType } from '@otl/common/enum/notification'

export class NotificationPrismaRepository implements NotificationRepository {
  getAllNotification(): Promise<Notification[]> {
    throw new Error('Method not implemented.')
  }

  getNotification(_type: NotificationType): Promise<Notification> {
    throw new Error('Method not implemented.')
  }

  findById(_id: number): Promise<UserNotification | null> {
    throw new Error('Method not implemented.')
  }

  findByUserId(_userId: number): Promise<UserNotification[] | null> {
    throw new Error('Method not implemented.')
  }

  findByUserIdAndType(_userId: number, _type: NotificationType): Promise<UserNotification | null> {
    throw new Error('Method not implemented.')
  }

  updateMany(_notifications: UserNotification[]): Promise<UserNotification[]> {
    throw new Error('Method not implemented.')
  }

  createMany(_notifications: UserNotificationCreate[]): Promise<UserNotification[]> {
    throw new Error('Method not implemented.')
  }

  save(notification: UserNotificationCreate): Promise<UserNotification>

  save(notification: UserNotification): Promise<UserNotification>

  save(notification: UserNotificationCreate | UserNotification): Promise<UserNotification>

  save(_notification: UserNotification | UserNotificationCreate): Promise<UserNotification> {
    throw new Error('Method not implemented.')
  }

  upsert(_notification: UserNotificationCreate): Promise<UserNotification> {
    throw new Error('Method not implemented.')
  }

  upsertMany(_notifications: UserNotificationCreate[]): Promise<UserNotificationCreate> {
    throw new Error('Method not implemented.')
  }
}
