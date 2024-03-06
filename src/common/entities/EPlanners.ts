import { Prisma } from '@prisma/client';

export namespace EPlanners {
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
            subject_course: true,
          },
        });
      export type Extended = Prisma.planner_futureplanneritemGetPayload<
        typeof Extended
      >;

      export const Details =
        Prisma.validator<Prisma.planner_futureplanneritemArgs>()({
          include: {
            subject_course: true,
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
            subject_lecture: true,
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
                course: true,
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
