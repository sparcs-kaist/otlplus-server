import { Prisma } from '@prisma/client'

export namespace EAgreement {
  export type Basic = Prisma.agreementGetPayload<Prisma.agreementDefaultArgs>

  export const UserAgreement = Prisma.validator<Prisma.session_userprofile_agreementDefaultArgs>()({
    include: {
      userprofile: true,
      agreement: true,
    },
  })
  export type UserAgreement = Prisma.session_userprofile_agreementGetPayload<typeof UserAgreement>
}
