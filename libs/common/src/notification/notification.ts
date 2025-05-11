import { AgreementType } from '@otl/common/enum/agreement'
import { NotificationType } from '@otl/common/enum/notification'

export class _Notification {
  public static templatePath: string = 'notification'

  id!: number

  name!: NotificationType

  agreementType!: AgreementType
}

export class _UserNotification {
  id!: number

  userId!: number

  notificationType!: NotificationType

  active!: boolean
}

export class _NotificationRequest {
  id!: number | null

  notificationType!: NotificationType

  userId!: number

  content!: { title: string, body: string }

  requestId!: string

  scheduleAt!: Date

  isCompleted!: boolean

  isRead!: boolean
}
