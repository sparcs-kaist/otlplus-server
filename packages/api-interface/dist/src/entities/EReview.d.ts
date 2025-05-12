import { Prisma } from '@prisma/client';
export declare namespace EReview {
  const Basic: {};
  type Basic = Prisma.review_reviewGetPayload<typeof Basic>;
  const Details: {
    include: {
      course: {
        include: {
          lecture: true;
          subject_department: true;
          subject_course_professors: {
            include: {
              professor: true;
            };
          };
        };
      };
      lecture: {
        include: {
          subject_department: true;
          subject_lecture_professors: {
            include: {
              professor: true;
            };
          };
          subject_classtime: true;
          subject_examtime: true;
        };
      };
      review_reviewvote: true;
    };
  };
  type Details = Prisma.review_reviewGetPayload<typeof Details>;
  const WithLectures: {
    include: {
      lecture: {};
    };
  };
  type WithLectures = Prisma.review_reviewGetPayload<typeof WithLectures>;
  namespace EReviewVote {
    const Basic: {};
    type Basic = Prisma.review_reviewvoteGetPayload<typeof Basic>;
  }
}
