import { Prisma } from '@prisma/client'

import { ELectureV2 } from './ELectureV2'

export namespace EWishlist {
  export const WithLectures = Prisma.validator<Prisma.timetable_wishlistDefaultArgs>()({
    include: {
      timetable_wishlist_lectures: {
        include: {
          subject_lecture: {
            include: ELectureV2.Details.include,
          },
        },
        where: { subject_lecture: { deleted: false } },
      },
    },
  })

  export type WithLectures = Prisma.timetable_wishlistGetPayload<typeof WithLectures>
}
