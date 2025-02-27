import { Prisma } from '@prisma/client';
import { ECourse } from '@otl/api-interface/src/entities/ECourse';
import { ELecture } from '@otl/api-interface/src/entities/ELecture';

export namespace EReview {
  export const Basic = Prisma.validator<Prisma.review_reviewDefaultArgs>()({});
  export type Basic = Prisma.review_reviewGetPayload<typeof Basic>;

  export const Details = Prisma.validator<Prisma.review_reviewDefaultArgs>()({
    include: {
      course: ECourse.Details,
      lecture: ELecture.Details,
      review_reviewvote: true,
    },
  });
  export type Details = Prisma.review_reviewGetPayload<typeof Details>;

  export const WithLectures =
    Prisma.validator<Prisma.review_reviewDefaultArgs>()({
      include: {
        lecture: ELecture.Basic,
      },
    });

  export type WithLectures = Prisma.review_reviewGetPayload<
    typeof WithLectures
  >;

  export namespace EReviewVote {
    export const Basic =
      Prisma.validator<Prisma.review_reviewvoteDefaultArgs>()({});
    export type Basic = Prisma.review_reviewvoteGetPayload<typeof Basic>;
  }
}
