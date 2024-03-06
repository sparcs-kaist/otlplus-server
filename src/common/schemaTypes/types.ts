import { Prisma } from '@prisma/client';

export type userSelectResultType = Prisma.session_userprofileGetPayload<{
  include: Prisma.session_userprofileInclude;
}>;

export type courseSelectResultType = Prisma.subject_courseGetPayload<{
  include: Prisma.subject_courseInclude;
}>;

export const courseBasic = Prisma.validator<Prisma.subject_courseArgs>()({});

export const courseDetails = Prisma.validator<Prisma.subject_courseArgs>()({
  include: {
    subject_department: true,
    subject_course_professors: { include: { professor: true } },
    lecture: true,
  },
});

export const lectureExtended = Prisma.validator<Prisma.subject_lectureArgs>()({
  include: {
    subject_department: true,
    subject_lecture_professors: { include: { professor: true } },
  },
});

export const lectureDetails = Prisma.validator<Prisma.subject_lectureArgs>()({
  include: {
    subject_department: true,
    subject_lecture_professors: { include: { professor: true } },
    subject_classtime: true,
    subject_examtime: true,
  },
});

export const timeTableDetails =
  Prisma.validator<Prisma.timetable_timetableArgs>()({
    include: {
      timetable_timetable_lectures: {
        include: {
          subject_lecture: lectureDetails,
        },
      },
    },
  });

const majorTrack = Prisma.validator<Prisma.graduation_majortrackArgs>()({
  include: {
    subject_department: true,
  },
});

export const additionalTrack =
  Prisma.validator<Prisma.graduation_additionaltrackArgs>()({
    include: {
      subject_department: true,
    },
  });

export const takenPlannerItem =
  Prisma.validator<Prisma.planner_takenplanneritemArgs>()({
    include: {
      subject_lecture: {
        include: {
          ...lectureDetails.include,
          course: courseDetails,
        },
      },
    },
  });

export const arbitraryPlannerItem =
  Prisma.validator<Prisma.planner_arbitraryplanneritemArgs>()({
    include: {
      subject_department: true,
    },
  });

export const futurePlannerItem =
  Prisma.validator<Prisma.planner_futureplanneritemArgs>()({
    include: {
      subject_course: courseDetails,
    },
  });

export const plannerDetails = Prisma.validator<Prisma.planner_plannerArgs>()({
  include: {
    planner_planner_additional_tracks: {
      include: {
        graduation_additionaltrack: additionalTrack,
      },
    },
    graduation_generaltrack: true,
    graduation_majortrack: majorTrack,
    planner_takenplanneritem: takenPlannerItem,
    planner_arbitraryplanneritem: arbitraryPlannerItem,
    planner_futureplanneritem: futurePlannerItem,
  },
});

export type NESTED = true;

export const reviewDetails = Prisma.validator<Prisma.review_reviewArgs>()({
  include: {
    course: courseDetails,
    lecture: lectureDetails,
    review_reviewvote: true,
  },
});

export const lectureReviews = Prisma.validator<Prisma.subject_lectureArgs>()({
  include: {
    review: {
      include: {
        course: courseDetails,
        lecture: lectureDetails,
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
            include: lectureDetails.include,
          },
        },
        where: { subject_lecture: { deleted: false } },
      },
    },
  });

export type LectureReviewDetails = Prisma.subject_lectureGetPayload<
  typeof lectureReviews
>;
export type ReviewDetails = Prisma.review_reviewGetPayload<
  typeof reviewDetails
>;
export type LectureDetails = Prisma.subject_lectureGetPayload<
  typeof lectureDetails
>;
export type LectureExtended = Prisma.subject_lectureGetPayload<
  typeof lectureExtended
>;
export type LectureBasic = Prisma.subject_lectureGetPayload<null>;
export type CourseBasic = Prisma.subject_courseGetPayload<typeof courseBasic>;
export type CourseDetails = Prisma.subject_courseGetPayload<
  typeof courseDetails
>;
export type TimeTableDetails = Prisma.timetable_timetableGetPayload<
  typeof timeTableDetails
>;
export type TimeTableBasic = Prisma.timetable_timetableGetPayload<null>;
export type SemesterBasic = Prisma.subject_semesterGetPayload<null>;
export type PlannerBasic = Prisma.planner_plannerGetPayload<null>;
export type PlannerDetails = Prisma.planner_plannerGetPayload<
  typeof plannerDetails
>;
export type ArbitraryPlannerItem =
  Prisma.planner_arbitraryplanneritemGetPayload<typeof arbitraryPlannerItem>;
export type FuturePlannerItem = Prisma.planner_futureplanneritemGetPayload<
  typeof futurePlannerItem
>;
export type TakenPlannerItem = Prisma.planner_takenplanneritemGetPayload<
  typeof takenPlannerItem
>;
export type GeneralTrackBasic = Prisma.graduation_generaltrackGetPayload<null>;
export type MajorTrackDetails = Prisma.graduation_majortrackGetPayload<
  typeof majorTrack
>;
export type AdditionalTrackDetails =
  Prisma.graduation_additionaltrackGetPayload<typeof additionalTrack>;

export type WishlistWithLectures = Prisma.timetable_wishlistGetPayload<
  typeof wishlistWithLectures
>;

export function isLectureDetails(
  lecture: LectureExtended | LectureDetails,
): lecture is LectureDetails {
  return 'subject_classtime' in lecture && 'subject_examtime' in lecture;
}
