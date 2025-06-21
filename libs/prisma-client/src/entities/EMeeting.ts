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
      result: {
        include: {
          timeblocks: true,
        },
      },
    },
  })

  export type Group = Prisma.meeting_groupGetPayload<typeof Group>

  export const Result = Prisma.validator<Prisma.meeting_resultDefaultArgs>()({
    include: {
      timeblocks: true,
      meeting_group: {
        include: {
          members: {
            include: {
              timeblocks: true,
            },
          },
        },
      },
    },
  })

  export type Result = Prisma.meeting_resultGetPayload<typeof Result>

  export namespace Member {
    export type Basic = Prisma.meeting_memberGetPayload<Prisma.meeting_memberDefaultArgs>

    export const WithTimeblocks = Prisma.validator<Prisma.meeting_memberDefaultArgs>()({
      include: {
        timeblocks: true,
      },
    })

    export type WithTimeblocks = Prisma.meeting_memberGetPayload<typeof WithTimeblocks>
  }
}
