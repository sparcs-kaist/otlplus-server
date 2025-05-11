import { Injectable } from '@nestjs/common'
import {
  FCMNotificationRequest,
  isFCMRequest,
  Notification,
  NotificationRequestCreate,
  UserNotification,
  UserNotificationCreate,
} from '@otl/server-nest/modules/notification/domain/notification'
import { NotificationRepository } from '@otl/server-nest/modules/notification/domain/notification.repository'
import { StatusCodes } from 'http-status-codes'

import { NotificationType } from '@otl/common/enum/notification'
import { NotificationException } from '@otl/common/exception/notification.exception'
import { OtlException } from '@otl/common/exception/otl.exception'
import { getCurrentMethodName } from '@otl/common/utils'

import {
  mapNotification,
  mapNotificationHistory,
  mapUserNotification,
} from '@otl/prisma-client/common/mapper/notification'
import { ENotification } from '@otl/prisma-client/entities/ENotification'
import { PrismaService } from '@otl/prisma-client/prisma.service'

@Injectable()
export class NotificationPrismaRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllNotification(): Promise<Notification[]> {
    const notifications = await this.prisma.notification.findMany()
    return notifications.map(mapNotification)
  }

  async getNotification(type: NotificationType): Promise<Notification> {
    const notification = await this.prisma.notification.findFirst({
      where: {
        name: type,
      },
    })
    if (!notification) {
      throw new NotificationException(
        StatusCodes.INTERNAL_SERVER_ERROR,
        NotificationException.NO_NOTIFICATION,
        getCurrentMethodName(),
      )
    }
    return mapNotification(notification)
  }

  async findById(id: number): Promise<UserNotification | null> {
    const userNotification = await this.prisma.session_userprofile_notification.findFirst({
      where: {
        id,
      },
      include: ENotification.UserNotification.include,
    })
    if (!userNotification) {
      return null
    }
    return mapUserNotification(userNotification)
  }

  async findByUserId(userId: number): Promise<UserNotification[] | null> {
    const userNotifications = await this.prisma.session_userprofile_notification.findMany({
      where: {
        userprofile_id: userId,
      },
      include: ENotification.UserNotification.include,
    })
    if (!userNotifications) {
      return null
    }
    return userNotifications.map(mapUserNotification)
  }

  async findByUserIdAndType(userId: number, type: NotificationType): Promise<UserNotification | null> {
    const notification = await this.prisma.notification.findFirst({
      where: {
        name: type,
      },
    })
    if (!notification) {
      throw new NotificationException(
        StatusCodes.INTERNAL_SERVER_ERROR,
        NotificationException.NO_NOTIFICATION,
        getCurrentMethodName(),
      )
    }
    const userNotification = await this.prisma.session_userprofile_notification.findUnique({
      where: {
        userprofile_id_notification_id: {
          userprofile_id: userId,
          notification_id: notification.id,
        },
      },
      include: ENotification.UserNotification.include,
    })
    if (!userNotification) {
      return null
    }
    return mapUserNotification(userNotification)
  }

  async updateMany(notifications: UserNotification[]): Promise<UserNotification[]> {
    return await Promise.all(notifications.map((n) => this.save(n)))
  }

  async createMany(notifications: UserNotificationCreate[]): Promise<UserNotification[]> {
    const allNotificationTypes = await this.getAllNotification()
    const allNotificationTypesMap = new Map<string, number>()
    allNotificationTypes.forEach((e) => {
      allNotificationTypesMap.set(e.agreementType, e.id)
    })
    const notificationCreate = notifications.map((n) => {
      const notificationTypeId = allNotificationTypesMap.get(n.notificationType)
      if (notificationTypeId == null) {
        throw new NotificationException(
          StatusCodes.INTERNAL_SERVER_ERROR,
          NotificationException.NO_NOTIFICATION,
          getCurrentMethodName(),
        )
      }
      return {
        userId: n.userId,
        notificationId: notificationTypeId,
      }
    })
    await this.prisma.session_userprofile_notification.createMany({
      data: notificationCreate.map((e) => ({
        userprofile_id: e.userId,
        notification_id: e.notificationId,
      })),
    })
    const userNotifications = await this.prisma.session_userprofile_notification.findMany({
      where: {
        userprofile_id: {
          in: notificationCreate.map((e) => e.userId),
        },
      },
      include: ENotification.UserNotification.include,
    })
    return userNotifications.map((e) => mapUserNotification(e))
  }

  save(notification: UserNotificationCreate): Promise<UserNotification>

  save(notification: UserNotification): Promise<UserNotification>

  save(notification: UserNotificationCreate | UserNotification): Promise<UserNotification>

  async save(notification: UserNotification | UserNotificationCreate): Promise<UserNotification> {
    if ('id' in notification) {
      return this.prisma.session_userprofile_notification
        .update({
          where: {
            id: notification.id,
          },
          data: {
            is_active: notification.active,
          },
          include: ENotification.UserNotification.include,
        })
        .then((e) => mapUserNotification(e))
    }
    const { userId, notificationType } = notification
    const notificationTypeId = await this.prisma.notification.findFirst({
      where: {
        name: notificationType,
      },
    })
    if (!notificationTypeId) {
      throw new NotificationException(
        StatusCodes.INTERNAL_SERVER_ERROR,
        NotificationException.NO_NOTIFICATION,
        getCurrentMethodName(),
      )
    }
    const userNotification = await this.prisma.session_userprofile_notification.create({
      data: {
        userprofile_id: userId,
        notification_id: notificationTypeId.id,
        is_active: notification.active,
      },
      include: ENotification.UserNotification.include,
    })
    return mapUserNotification(userNotification)
  }

  async upsert(notification: UserNotificationCreate): Promise<UserNotification> {
    const { userId, notificationType } = notification
    const allNotificationTypes = await this.getAllNotification()
    const allNotificationTypesMap = new Map<string, number>()
    allNotificationTypes.forEach((e) => {
      allNotificationTypesMap.set(e.name, e.id)
    })
    const notificationTypeId = allNotificationTypesMap.get(notificationType)
    if (notificationTypeId == null) {
      throw new OtlException(404, 'Agreement not found')
    }
    return this.prisma.session_userprofile_notification
      .upsert({
        where: {
          userprofile_id_notification_id: {
            userprofile_id: userId,
            notification_id: notificationTypeId,
          },
        },
        create: {
          userprofile_id: userId,
          notification_id: notificationTypeId,
          is_active: false,
        },
        update: {
          is_active: notification.active,
        },
        include: ENotification.UserNotification.include,
      })
      .then((e) => mapUserNotification(e))
  }

  async upsertMany(notifications: UserNotificationCreate[]): Promise<UserNotification[]> {
    return await Promise.all(notifications.map((e) => this.upsert(e)))
  }

  async getNotificationRequest(uuid: string): Promise<FCMNotificationRequest | null> {
    const notificationHistory = await this.prisma.session_userprofile_notification_history.findFirst({
      where: {
        notification_req_id: uuid,
      },
      include: ENotification.EHistory.Basic.include,
    })
    if (!notificationHistory) {
      return null
    }
    return mapNotificationHistory(notificationHistory)
  }

  async getNotificationRequestById(requestId: number): Promise<FCMNotificationRequest> {
    const notificationHistory = await this.prisma.session_userprofile_notification_history.findFirst({
      where: {
        id: requestId,
      },
      include: ENotification.EHistory.Basic.include,
    })
    if (!notificationHistory) {
      throw new NotificationException(
        StatusCodes.INTERNAL_SERVER_ERROR,
        NotificationException.NO_NOTIFICATION_REQUEST,
        getCurrentMethodName(),
      )
    }
    return mapNotificationHistory(notificationHistory)
  }

  async saveRequest(notification: NotificationRequestCreate | FCMNotificationRequest): Promise<FCMNotificationRequest> {
    if ('id' in notification) {
      return this.prisma.session_userprofile_notification_history
        .update({
          where: {
            id: notification.id as number,
          },
          data: {
            read_at: new Date(),
          },
          include: ENotification.EHistory.Basic.include,
        })
        .then((e) => mapNotificationHistory(e))
    }
    const { userId, notificationType } = notification
    const notificationTypeId = await this.prisma.notification.findFirst({
      where: {
        name: notificationType,
      },
    })
    if (!notificationTypeId) {
      throw new NotificationException(
        StatusCodes.INTERNAL_SERVER_ERROR,
        NotificationException.NO_NOTIFICATION,
        getCurrentMethodName(),
      )
    }
    const notificationRequest = await this.prisma.session_userprofile_notification_history.create({
      data: {
        userprofile_id: userId,
        notification_id: notificationTypeId.id,
        notification_req_id: notification.requestId,
        created_at: notification.scheduleAt,
        content: JSON.stringify(notification.content),
        fcm_id: isFCMRequest(notification) ? notification.fcmId : '',
        to: isFCMRequest(notification) ? notification.deviceToken : '',
      },
      include: ENotification.UserNotification.include,
    })
    return mapNotificationHistory(notificationRequest)
  }
}
