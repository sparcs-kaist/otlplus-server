import { Prisma } from '@prisma/client';
import { ECourse } from '../entities/ECourse';
import { ELecture } from '../entities/ELecture';

export type NESTED = true;

export const lectureReviews = Prisma.validator<Prisma.subject_lectureArgs>()({
  include: {
    review: {
      include: {
        course: ECourse.Details,
        lecture: ELecture.Details,
        review_reviewvote: true,
      },
    },
  },
});

export const wishlistWithLectures =
  Prisma.validator<Prisma.timetable_wishlistArgs>()({
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

export type LectureBasic = Prisma.subject_lectureGetPayload<null>;
export type TimeTableBasic = Prisma.timetable_timetableGetPayload<null>;
export type SemesterBasic = Prisma.subject_semesterGetPayload<null>;

export type WishlistWithLectures = Prisma.timetable_wishlistGetPayload<
  typeof wishlistWithLectures
>;
