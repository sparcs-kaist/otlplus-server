import { UserDevice } from '@otl/server-nest/modules/device/domain/device'
import {
  FCMNotificationRequest,
  Notification,
  UserNotification,
} from '@otl/server-nest/modules/notification/domain/notification'

import { NotificationType } from '@otl/common/enum/notification'

import { EUser } from '@otl/prisma-client/entities'
import { EDevice } from '@otl/prisma-client/entities/EDevice'
import { ENotification } from '@otl/prisma-client/entities/ENotification'

export function mapUserDevice(entity: EDevice.Basic): UserDevice {
  return {
    id: entity.id,
    userId: entity.userprofile_id,
    deviceToken: entity.token,
    isActive: entity.is_active,
    deviceType: entity.deviceType,
    deviceOsVersion: entity.deviceOsVersion,
    appVersion: entity.appVersion,
  }
}

export function mapUserToUserDevice(entity: EUser.WithDevice): UserDevice[] {
  return entity.session_userprofile_device.map((device) => ({
    id: device.id,
    userId: entity.id,
    deviceToken: device.token,
    isActive: device.is_active,
    deviceType: device.deviceType,
    deviceOsVersion: device.deviceOsVersion,
    appVersion: device.appVersion,
  }))
}

export function mapNotification(entity: ENotification.Basic): Notification {
  const name = Object.values(NotificationType).find((e) => e === entity.name)

  if (!name) {
    throw new Error(`Invalid NotificationType: ${entity.name}`)
  }
  return {
    ...entity,
    name,
  }
}

export function mapUserNotification(entity: ENotification.UserNotification): UserNotification {
  const name = Object.values(NotificationType).find((e) => e === entity.noti.name)

  if (!name) {
    throw new Error(`Invalid NotificationType: ${entity.noti.name}`)
  }

  return {
    id: entity.id,
    userId: entity.userprofile_id,
    notificationType: name,
    active: entity.is_active,
  }
}

export function mapNotificationHistory(entity: ENotification.EHistory.Basic): FCMNotificationRequest {
  const name = Object.values(NotificationType).find((e) => e === entity.noti.name)

  if (!name) {
    throw new Error(`Invalid NotificationType: ${name}`)
  }

  return {
    ...entity,
    userId: entity.userprofile_id,
    isCompleted: true,
    isRead: !!entity.read_at,
    requestId: entity.notification_req_id,
    scheduleAt: entity.created_at,
    content: JSON.parse(entity.content),
    notificationType: name,
    deviceToken: entity.to ?? '',
  }
}
