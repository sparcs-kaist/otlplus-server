import { Prisma } from '@prisma/client'

export namespace ENotification {
  export type Basic = Prisma.notificationGetPayload<Prisma.notificationDefaultArgs>

  export const UserNotification = Prisma.validator<Prisma.session_userprofile_notificationDefaultArgs>()({
    include: {
      noti: true,
    },
  })
  export type UserNotification = Prisma.session_userprofile_notificationGetPayload<typeof UserNotification>

  export namespace EHistory {
    // eslint-disable-next-line no-shadow
    export const Basic = Prisma.validator<Prisma.session_userprofile_notification_historyDefaultArgs>()({
      include: {
        noti: true,
      },
    })
    export type Basic = Prisma.session_userprofile_notification_historyGetPayload<typeof Basic>
  }
}
