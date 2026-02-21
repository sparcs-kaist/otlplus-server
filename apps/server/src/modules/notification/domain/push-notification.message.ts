import { AgreementType } from '@otl/common/enum/agreement'

import { NotificationPriority } from './push-notification.enums'

export class BatchNotificationMessage {
  notificationId!: number

  batchId!: string

  type!: AgreementType

  priority!: NotificationPriority

  title!: string

  body!: string

  data!: Record<string, string>

  recipients!: BatchRecipient[]
}

export interface BatchRecipient {
  historyId: number
  userId: number
  deviceId: number
  fcmToken: string
}
