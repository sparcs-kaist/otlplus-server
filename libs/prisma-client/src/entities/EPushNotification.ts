import { Prisma } from '@prisma/client'

export namespace EPushNotification {
  export type Basic = Prisma.push_notificationGetPayload<Prisma.push_notificationDefaultArgs>

  export const WithBatches = Prisma.validator<Prisma.push_notificationDefaultArgs>()({
    include: {
      batches: true,
    },
  })
  export type WithBatches = Prisma.push_notificationGetPayload<typeof WithBatches>
}

export namespace EPushNotificationBatch {
  export type Basic = Prisma.push_notification_batchGetPayload<Prisma.push_notification_batchDefaultArgs>

  export const WithHistories = Prisma.validator<Prisma.push_notification_batchDefaultArgs>()({
    include: {
      histories: true,
    },
  })
  export type WithHistories = Prisma.push_notification_batchGetPayload<typeof WithHistories>
}

export namespace EPushNotificationHistory {
  export type Basic = Prisma.push_notification_historyGetPayload<Prisma.push_notification_historyDefaultArgs>
}

export namespace EUserPushAgreement {
  export type Basic = Prisma.user_push_agreementGetPayload<Prisma.user_push_agreementDefaultArgs>
}
