export const NotificationChannel = {
  FCM: 'FCM',
  EMAIL: 'EMAIL',
} as const

export type NotificationChannel = (typeof NotificationChannel)[keyof typeof NotificationChannel]
