import { Prisma } from '@prisma/client'

export namespace EPersonal {
  export const Basic = Prisma.validator<Prisma.personal_blockDefaultArgs>()({
    include: {
      personal_timeblocks: true,
    },
  })

  export type Basic = Prisma.personal_blockGetPayload<typeof Basic>
}
