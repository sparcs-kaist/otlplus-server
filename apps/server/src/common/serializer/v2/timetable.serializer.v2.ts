import { ITimetableV2 } from '@otl/server-nest/common/interfaces/v2'

import { ETimetable } from '@otl/prisma-client/entities'

export const toJsonTimetableV2 = (timetable: ETimetable.Details | ETimetable.Basic): ITimetableV2.Response => ({
  id: timetable.id,
  year: timetable.year,
  semester: timetable.semester,
  timeTableOrder: timetable.arrange_order,
  userId: timetable.user_id,
})
