import { Prisma } from '@prisma/client'

import { ELecture } from './ELecture'

export namespace ETimetable {
  export type Basic = Prisma.timetable_timetableGetPayload<null>

  export const Details = Prisma.validator<Prisma.timetable_timetableDefaultArgs>()({
    include: {
      timetable_timetable_lectures: {
        include: {
          subject_lecture: ELecture.Details,
        },
      },
    },
  })

  export type Details = Prisma.timetable_timetableGetPayload<typeof Details>

  export const WithItems = Prisma.validator<Prisma.timetable_timetableDefaultArgs>()({
    include: {
      ...Details.include,
      timetable_timetable_customblocks: {
        include: { block_custom_blocks: { include: { times: { orderBy: { id: 'asc' } } } } },
      },
    },
  })

  export type WithItems = Prisma.timetable_timetableGetPayload<typeof WithItems>

  export const WithLectureClasstimes = Prisma.validator<Prisma.timetable_timetable_lecturesDefaultArgs>()({
    include: {
      subject_lecture: ELecture.WithClasstime,
    },
  })

  export type WithLectureClasstimes = Prisma.timetable_timetable_lecturesGetPayload<typeof WithLectureClasstimes>
}
