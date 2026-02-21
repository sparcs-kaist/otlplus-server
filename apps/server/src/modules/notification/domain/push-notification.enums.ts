export const NotificationScheduleType = {
  IMMEDIATE: 'IMMEDIATE',
  ONE_TIME: 'ONE_TIME',
  CRON: 'CRON',
} as const
export type NotificationScheduleType = (typeof NotificationScheduleType)[keyof typeof NotificationScheduleType]

export const NotificationTargetType = {
  ALL: 'ALL',
  SEGMENT: 'SEGMENT',
  MANUAL: 'MANUAL',
} as const
export type NotificationTargetType = (typeof NotificationTargetType)[keyof typeof NotificationTargetType]

export const NotificationPriority = {
  URGENT: 'URGENT',
  NORMAL: 'NORMAL',
  LOW: 'LOW',
} as const
export type NotificationPriority = (typeof NotificationPriority)[keyof typeof NotificationPriority]

export const NotificationHistoryStatus = {
  QUEUED: 'QUEUED',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  DLQ: 'DLQ',
} as const
export type NotificationHistoryStatus = (typeof NotificationHistoryStatus)[keyof typeof NotificationHistoryStatus]

export const BatchStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const
export type BatchStatus = (typeof BatchStatus)[keyof typeof BatchStatus]
