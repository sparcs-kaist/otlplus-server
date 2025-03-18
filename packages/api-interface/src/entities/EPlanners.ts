import { Prisma } from '@prisma/client';
import { ECourse } from '@otl/api-interface/src/entities/ECourse';
import { ELecture } from '@otl/api-interface/src/entities/ELecture';
import { ETrack } from '@otl/api-interface/src/entities/ETrack';

export namespace EPlanners {
  export namespace EItems {
    export namespace Future {
      export const Basic =
        Prisma.validator<Prisma.planner_futureplanneritemDefaultArgs>()({});
      export type Basic = Prisma.planner_futureplanneritemGetPayload<
        typeof Basic
      >;

      export const Extended =
        Prisma.validator<Prisma.planner_futureplanneritemDefaultArgs>()({
          include: {
            subject_course: ECourse.Extended,
          },
        });
      export type Extended = Prisma.planner_futureplanneritemGetPayload<
        typeof Extended
      >;

      export const Details =
        Prisma.validator<Prisma.planner_futureplanneritemDefaultArgs>()({
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
        Prisma.validator<Prisma.planner_takenplanneritemDefaultArgs>()({});
      export type Basic = Prisma.planner_takenplanneritemGetPayload<
        typeof Basic
      >;

      export const Extended =
        Prisma.validator<Prisma.planner_takenplanneritemDefaultArgs>()({
          include: {
            subject_lecture: ELecture.Extended,
          },
        });
      export type Extended = Prisma.planner_takenplanneritemGetPayload<
        typeof Extended
      >;

      export const Details =
        Prisma.validator<Prisma.planner_takenplanneritemDefaultArgs>()({
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
      export const CreateInput =
        Prisma.validator<Prisma.planner_arbitraryplanneritemUncheckedCreateInput>()(
          {},
        );
      export type CreateInput =
        Prisma.planner_arbitraryplanneritemUncheckedCreateInput;

      export const Basic =
        Prisma.validator<Prisma.planner_arbitraryplanneritemDefaultArgs>()({});
      export type Basic = Prisma.planner_arbitraryplanneritemGetPayload<
        typeof Basic
      >;

      export const Extended =
        Prisma.validator<Prisma.planner_arbitraryplanneritemDefaultArgs>()({
          include: {
            subject_department: true,
          },
        });
      export type Extended = Prisma.planner_arbitraryplanneritemGetPayload<
        typeof Extended
      >;

      export const Details =
        Prisma.validator<Prisma.planner_arbitraryplanneritemDefaultArgs>()({
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

  export const Basic = Prisma.validator<Prisma.planner_plannerDefaultArgs>()(
    {},
  );
  export type Basic = Prisma.planner_plannerGetPayload<typeof Basic>;

  export const Details = Prisma.validator<Prisma.planner_plannerDefaultArgs>()({
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

  export const Extended = Prisma.validator<Prisma.planner_plannerDefaultArgs>()({
    include: {
      planner_planner_additional_tracks: {
        include: {
          graduation_additionaltrack: ETrack.Additional,
        },
      },
      graduation_generaltrack: true,
      graduation_majortrack: ETrack.Major,
      planner_takenplanneritem: EPlanners.EItems.Taken.Extended,
      planner_arbitraryplanneritem: EPlanners.EItems.Arbitrary.Extended,
      planner_futureplanneritem: EPlanners.EItems.Future.Extended,
    },
  });

  export type Extended = Prisma.planner_plannerGetPayload<typeof Extended>;
}
