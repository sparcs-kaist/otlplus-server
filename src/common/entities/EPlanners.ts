import { Prisma } from '@prisma/client';
import { ECourse } from './ECourse';
import { ELecture } from './ELecture';
import { ETrack } from './ETrack';

export namespace EPlanners {
  export const Basic = Prisma.validator<Prisma.planner_plannerArgs>()({});
  export type Basic = Prisma.planner_plannerGetPayload<typeof Basic>;

  export const Details = Prisma.validator<Prisma.planner_plannerArgs>()({
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
  });

  export type Details = Prisma.planner_plannerGetPayload<typeof Details>;

  export namespace EItems {
    export namespace Future {
      export const Basic =
        Prisma.validator<Prisma.planner_futureplanneritemArgs>()({});
      export type Basic = Prisma.planner_futureplanneritemGetPayload<
        typeof Basic
      >;

      export const Extended =
        Prisma.validator<Prisma.planner_futureplanneritemArgs>()({
          include: {
            subject_course: ECourse.Details,
          },
        });
      export type Extended = Prisma.planner_futureplanneritemGetPayload<
        typeof Extended
      >;

      export const Details =
        Prisma.validator<Prisma.planner_futureplanneritemArgs>()({
          include: {
            ...Extended.include,
            planner_planner: true,
          },
        });
      export type Details = Prisma.planner_futureplanneritemGetPayload<
        typeof Details
      >;
    }

    export namespace Taken {
      export const Basic =
        Prisma.validator<Prisma.planner_takenplanneritemArgs>()({});
      export type Basic = Prisma.planner_futureplanneritemGetPayload<
        typeof Basic
      >;

      export const Extended =
        Prisma.validator<Prisma.planner_takenplanneritemArgs>()({
          include: {
            subject_lecture: ELecture.Details,
          },
        });
      export type Extended = Prisma.planner_takenplanneritemGetPayload<
        typeof Extended
      >;

      export const Details =
        Prisma.validator<Prisma.planner_takenplanneritemArgs>()({
          include: {
            subject_lecture: {
              include: {
                ...ELecture.Details.include,
                course: ECourse.Details,
              },
            },
          },
        });
      export type Details = Prisma.planner_takenplanneritemGetPayload<
        typeof Details
      >;
    }
    export namespace Arbitrary {
      export const Basic =
        Prisma.validator<Prisma.planner_arbitraryplanneritemArgs>()({});
      export type Basic = Prisma.planner_arbitraryplanneritemGetPayload<
        typeof Basic
      >;

      export const Extended =
        Prisma.validator<Prisma.planner_arbitraryplanneritemArgs>()({
          include: {
            subject_department: true,
          },
        });
      export type Extended = Prisma.planner_arbitraryplanneritemGetPayload<
        typeof Extended
      >;

      export const Details =
        Prisma.validator<Prisma.planner_arbitraryplanneritemArgs>()({
          include: {
            subject_department: true,
            planner_planner: true,
          },
        });
      export type Details = Prisma.planner_arbitraryplanneritemGetPayload<
        typeof Details
      >;
    }
  }
}
