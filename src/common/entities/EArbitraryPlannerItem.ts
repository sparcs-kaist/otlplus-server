import { Prisma } from '@prisma/client';

export namespace EArbitraryPlannerItem {
  export const Basic =
    Prisma.validator<Prisma.planner_arbitraryplanneritemArgs>()({});
  export type Basic = Prisma.planner_arbitraryplanneritemGetPayload<
    typeof Basic
  >;

  export const Details =
    Prisma.validator<Prisma.planner_arbitraryplanneritemArgs>()({
      include: {
        subject_department: true,
      },
    });
  export type Details = Prisma.planner_arbitraryplanneritemGetPayload<
    typeof Details
  >;
}
