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

  notificationId!: number

  active!: boolean
}

export class _NotificationRequest {
  notificationId!: number

  userId!: number

  content!: string

  requestId!: string

  scheduleAt!: Date

  isCompleted!: boolean

  isRead!: boolean
}
