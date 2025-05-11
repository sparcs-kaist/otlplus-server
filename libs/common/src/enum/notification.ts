import { AgreementType } from '@otl/common/enum/agreement'

export const NotificationType = {
  APP_UPDATE: 'APP_UPDATE',
  APP_UPDATE_FORCE: 'APP_UPDATE_FORCE',
  COURSE_TIME: 'COURSE_TIME',
} as const

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]

export const NotificationAgreementMap: Record<NotificationType, AgreementType> = {
  APP_UPDATE: 'INFO',
  APP_UPDATE_FORCE: 'INFO',
  COURSE_TIME: 'MARKETING',
}

export const NotificationChannel = {
  FCM: 'FCM',
  EMAIL: 'EMAIL',
} as const

export type NotificationChannel = (typeof NotificationChannel)[keyof typeof NotificationChannel]
