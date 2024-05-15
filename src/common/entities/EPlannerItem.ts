import { Prisma } from '@prisma/client';
import { ECourse } from './ECourse';
import { ELecture } from './ELecture';

export namespace EPlannerItem {
  export const Taken = Prisma.validator<Prisma.planner_takenplanneritemArgs>()({
    include: {
      subject_lecture: {
        include: {
          ...ELecture.Details.include,
          course: ECourse.Details,
        },
      },
    },
  });

  export type Taken = Prisma.planner_takenplanneritemGetPayload<typeof Taken>;

  export const Arbitrary =
    Prisma.validator<Prisma.planner_arbitraryplanneritemArgs>()({
      include: {
        subject_department: true,
      },
    });
  export type Arbitrary = Prisma.planner_arbitraryplanneritemGetPayload<
    typeof Arbitrary
  >;

  export const Future =
    Prisma.validator<Prisma.planner_futureplanneritemArgs>()({
      include: {
        subject_course: ECourse.Details,
      },
    });

  export type Future = Prisma.planner_futureplanneritemGetPayload<
    typeof Future
  >;
}
