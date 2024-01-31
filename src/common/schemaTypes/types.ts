import { Prisma } from '@prisma/client';

export type userSelectResultType = Prisma.session_userprofileGetPayload<{
  include: Prisma.session_userprofileInclude;
}>;

export type courseSelectResultType = Prisma.subject_courseGetPayload<{
  include: Prisma.subject_courseInclude;
}>;

export const courseDetails = Prisma.validator<Prisma.subject_courseArgs>()({
  include: {
    subject_department: true,
    subject_course_professors: { include: { professor: true } },
    lecture: true,
    subject_courseuser: true,
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

export type NESTED = true;

const reviewDetails = Prisma.validator<Prisma.review_reviewArgs>()({
  include: {
    course: courseDetails,
    lecture: lectureDetails,
    review_reviewvote: true,
  },
});

const lectureReviews = Prisma.validator<Prisma.subject_lectureArgs>()({
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

export const wishlistLectures =
  Prisma.validator<Prisma.timetable_wishlistArgs>()({
    include: {
      timetable_wishlist_lectures: {
        include: {
          subject_lecture: {
            include: lectureExtended.include,
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
export type CourseDetails = Prisma.subject_courseGetPayload<
  typeof courseDetails
>;
export type TimeTableDetails = Prisma.timetable_timetableGetPayload<
  typeof timeTableDetails
>;
export type TimeTableBasic = Prisma.timetable_timetableGetPayload<null>;
export type SemesterBasic = Prisma.subject_semesterGetPayload<null>;

export type WishlistWithLectures = Prisma.timetable_wishlistGetPayload<
  typeof wishlistLectures
>;

export function isLectureDetails(
  lecture: LectureExtended | LectureDetails,
): lecture is LectureDetails {
  return 'subject_classtime' in lecture && 'subject_examtime' in lecture;
}
