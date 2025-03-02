import { Prisma } from '@prisma/client';
import { ELecture } from '@otl/api-interface/src/entities/ELecture';

export namespace EWishlist {
  export const WithLectures =
    Prisma.validator<Prisma.timetable_wishlistDefaultArgs>()({
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
    });

  export type WithLectures = Prisma.timetable_wishlistGetPayload<
    typeof WithLectures
  >;
}
