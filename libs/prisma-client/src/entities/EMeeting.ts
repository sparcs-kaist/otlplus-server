import { Prisma } from '@prisma/client'

export namespace EMeeting {
  export const Group = Prisma.validator<Prisma.meeting_groupDefaultArgs>()({
    include: {
      days: true,
      members: {
        include: {
          timeblocks: true,
        },
      },
    },
  })

  export type Group = Prisma.meeting_groupGetPayload<typeof Group>
}
