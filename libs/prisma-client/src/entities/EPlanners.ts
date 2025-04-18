import { Prisma } from '@prisma/client'

import { ECourse } from './ECourse'
import { ELecture } from './ELecture'
import { ETrack } from './ETrack'

export namespace EPlanners {
  export namespace EItems {
    export namespace Future {
      export type Basic = Prisma.planner_futureplanneritemGetPayload<Prisma.planner_futureplanneritemDefaultArgs>

      export const Extended = {
        include: {
          subject_course: ECourse.Details,
        },
      } satisfies Prisma.planner_futureplanneritemDefaultArgs
      export type Extended = Prisma.planner_futureplanneritemGetPayload<typeof Extended>

      export const Details = {
        include: {
          ...Extended.include,
          planner_planner: true,
        },
      } satisfies Prisma.planner_futureplanneritemDefaultArgs

      export type Details = Prisma.planner_futureplanneritemGetPayload<typeof Details>
    }

    export namespace Taken {
      export const Basic = Prisma.validator<Prisma.planner_takenplanneritemDefaultArgs>()({})
      export type Basic = Prisma.planner_takenplanneritemGetPayload<typeof Basic>

      export const Extended = {
        include: {
          subject_lecture: ELecture.Details,
        },
      } satisfies Prisma.planner_takenplanneritemDefaultArgs
      export type Extended = Prisma.planner_takenplanneritemGetPayload<typeof Extended>

      export const Details = {
        include: {
          subject_lecture: {
            include: {
              ...ELecture.Details.include,
              course: ECourse.Details,
            },
          },
        },
      } satisfies Prisma.planner_takenplanneritemDefaultArgs
      export type Details = Prisma.planner_takenplanneritemGetPayload<typeof Details>
    }

    export namespace Arbitrary {
      export type CreateInput = Prisma.planner_arbitraryplanneritemUncheckedCreateInput

      export type Basic = Prisma.planner_arbitraryplanneritemGetPayload<Prisma.planner_arbitraryplanneritemDefaultArgs>

      export const Extended = {
        include: {
          subject_department: true,
        },
      } satisfies Prisma.planner_arbitraryplanneritemDefaultArgs
      export type Extended = Prisma.planner_arbitraryplanneritemGetPayload<typeof Extended>

      export const Details = {
        include: {
          subject_department: true,
          planner_planner: true,
        },
      } satisfies Prisma.planner_arbitraryplanneritemDefaultArgs
      export type Details = Prisma.planner_arbitraryplanneritemGetPayload<typeof Details>
    }
  }

  export type CreateBody = {
    general_track: number
    major_track: number
    additional_tracks?: number[]
    start_year: number
    end_year: number
    arrange_order: number
  }

  export type Basic = Prisma.planner_plannerGetPayload<Prisma.planner_plannerDefaultArgs>
  export const Details = {
    include: {
      planner_planner_additional_tracks: {
        include: {
          graduation_additionaltrack: ETrack.Additional,
        },
      },
      graduation_generaltrack: true,
      graduation_majortrack: ETrack.Major,
      planner_takenplanneritem: EPlanners.EItems.Taken.Details,
      planner_arbitraryplanneritem: EPlanners.EItems.Arbitrary.Extended,
      planner_futureplanneritem: EPlanners.EItems.Future.Extended,
    },
  } satisfies Prisma.planner_plannerDefaultArgs
  export type Details = Prisma.planner_plannerGetPayload<typeof Details>
}
