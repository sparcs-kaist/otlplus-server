import { ISchedules } from '@otl/server-nest/common/interfaces'

import { ESchedules } from '@otl/prisma-client/entities'

export const toJsonSchedules = (schedule: ESchedules.Basic): ISchedules.Basic => ({
  year: schedule.year,
  from: schedule.from,
  to: schedule.to,
  name: schedule.name,
})
