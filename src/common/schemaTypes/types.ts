import { Prisma } from '@prisma/client';
import { ECourse } from '../entities/ECourse';
import { ELecture } from '../entities/ELecture';
import { EPlannerItem } from '../entities/EPlannerItem';
import { ETrack } from '../entities/ETrack';

export const plannerDetails = Prisma.validator<Prisma.planner_plannerArgs>()({
  include: {
    planner_planner_additional_tracks: {
      include: {
        graduation_additionaltrack: ETrack.Additional,
      },
    },
    graduation_generaltrack: true,
    graduation_majortrack: ETrack.Major,
    planner_takenplanneritem: EPlannerItem.Taken,
    planner_arbitraryplanneritem: EPlannerItem.Arbitrary,
    planner_futureplanneritem: EPlannerItem.Future,
  },
});

export type NESTED = true;

export const reviewDetails = Prisma.validator<Prisma.review_reviewArgs>()({
  include: {
    course: ECourse.Details,
    lecture: ELecture.Details,
    review_reviewvote: true,
  },
});

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

export type ReviewDetails = Prisma.review_reviewGetPayload<
  typeof reviewDetails
>;
export type LectureBasic = Prisma.subject_lectureGetPayload<null>;
export type TimeTableBasic = Prisma.timetable_timetableGetPayload<null>;
export type SemesterBasic = Prisma.subject_semesterGetPayload<null>;
export type PlannerBasic = Prisma.planner_plannerGetPayload<null>;
export type PlannerDetails = Prisma.planner_plannerGetPayload<
  typeof plannerDetails
>;

export type WishlistWithLectures = Prisma.timetable_wishlistGetPayload<
  typeof wishlistWithLectures
>;
