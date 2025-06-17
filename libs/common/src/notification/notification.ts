import { AgreementType } from '@otl/common/enum/agreement'

export class _Notification {
  public static templatePath: string = 'notification'

  id!: number

  name!: string

  description!: string

  agreementType!: AgreementType
}

export class _UserNotification {
  id!: number

  userId!: number

  notificationName!: string

  active!: boolean
}

export class _NotificationRequest {
  id!: number | null

  notificationName!: string

  userId!: number

  content!: { title: string, body: string }

  requestId!: string

  scheduleAt!: Date

  isCompleted!: boolean

  isRead!: boolean
}
