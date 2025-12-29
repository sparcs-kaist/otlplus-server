import { Prisma } from '@prisma/client'

export namespace ESchedules {
  export const Basic = Prisma.validator<Prisma.schedulesDefaultArgs>()({})
  export type Basic = Prisma.schedulesGetPayload<typeof Basic>
  export type SchedulesResponse = { schedules: Basic[] }
}
