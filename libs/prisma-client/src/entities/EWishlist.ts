import { Prisma } from '@prisma/client'

import { ELecture } from './ELecture'

export namespace EWishlist {
  export const WithLectures = Prisma.validator<Prisma.timetable_wishlistDefaultArgs>()({
    include: {
      timetable_wishlist_lectures: {
        include: {
          subject_lecture: {
            include: ELecture.Details.include,
          },
        },
        where: { subject_lecture: { deleted: false } },
      },
    },
  })

  export type WithLectures = Prisma.timetable_wishlistGetPayload<typeof WithLectures>

  export const WithLecturesBySemesterArgs = (year: number, semester: number) => Prisma.validator<Prisma.timetable_wishlistDefaultArgs>()({
    include: {
      timetable_wishlist_lectures: {
        where: { subject_lecture: { year, semester, deleted: false } },
        include: {
          subject_lecture: { include: ELecture.Details.include },
        },
      },
    },
  })

  export type WithLecturesBySemesterPayload = Prisma.timetable_wishlistGetPayload<
    ReturnType<typeof WithLecturesBySemesterArgs>
  >
}
