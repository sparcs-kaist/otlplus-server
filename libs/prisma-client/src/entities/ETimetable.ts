import { Prisma } from '@prisma/client'

import { ELecture } from './ELecture'
import { EPersonal } from './EPersonal'

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

  export const WithLectureClasstimes = Prisma.validator<Prisma.timetable_timetable_lecturesDefaultArgs>()({
    include: {
      subject_lecture: ELecture.WithClasstime,
    },
  })

  export type WithLectureClasstimes = Prisma.timetable_timetable_lecturesGetPayload<typeof WithLectureClasstimes>

  export const WithLectureClassTimesAndPersonals = Prisma.validator<Prisma.timetable_timetableDefaultArgs>()({
    include: {
      timetable_timetable_lectures: {
        include: {
          subject_lecture: ELecture.WithClasstime,
        },
      },
      personal_block: EPersonal.Basic,
    },
  })

  export type WithLectureClassTimesAndPersonals = Prisma.timetable_timetable_lecturesGetPayload<
    typeof WithLectureClassTimesAndPersonals
  >
}
