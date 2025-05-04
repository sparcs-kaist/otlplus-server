export const NotificationType = {
  APP_UPDATE: 'APP_UPDATE',
  APP_UPDATE_FORCE: 'APP_UPDATE_FORCE',
} as const

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]
