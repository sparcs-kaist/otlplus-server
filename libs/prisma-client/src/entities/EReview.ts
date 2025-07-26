import { Prisma } from '@prisma/client'

import { ELecture } from './ELecture'

export namespace EReview {
  export type Basic = Prisma.review_reviewGetPayload<Prisma.review_reviewDefaultArgs>

  export const Details = Prisma.validator<Prisma.review_reviewDefaultArgs>()({
    include: {
      // course: ECourse.Details,
      lecture: ELecture.Details,
      review_reviewvote: true,
    },
  })
  export type Details = Prisma.review_reviewGetPayload<typeof Details>

  export const WithLectures = Prisma.validator<Prisma.review_reviewDefaultArgs>()({
    include: {
      lecture: ELecture.Basic,
    },
  })

  export type WithLectures = Prisma.review_reviewGetPayload<typeof WithLectures>

  export namespace EReviewVote {
    // eslint-disable-next-line no-shadow
    export type Basic = Prisma.review_reviewvoteGetPayload<Prisma.review_reviewvoteDefaultArgs>
  }
}
