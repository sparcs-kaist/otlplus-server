import { Prisma } from '@prisma/client'

export namespace EDevice {
  export type Basic = Prisma.session_userprofile_deviceGetPayload<Prisma.session_userprofile_deviceDefaultArgs>

  export const DeviceWithUser = Prisma.validator<Prisma.session_userprofile_deviceDefaultArgs>()({
    include: {
      userprofile: true,
    },
  })
  export type DeviceWithUser = Prisma.session_userprofile_agreementGetPayload<typeof DeviceWithUser>
}
