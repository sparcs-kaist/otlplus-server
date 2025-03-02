import { Prisma } from '@prisma/client';

export namespace ETrack {
  export const Major = Prisma.validator<Prisma.graduation_majortrackArgs>()({
    include: {
      subject_department: true,
    },
  });

  export type Major = Prisma.graduation_majortrackGetPayload<typeof Major>;

  export const Additional =
    Prisma.validator<Prisma.graduation_additionaltrackArgs>()({
      include: {
        subject_department: true,
      },
    });

  export type Additional = Prisma.graduation_additionaltrackGetPayload<
    typeof Additional
  >;

  export type General = Prisma.graduation_generaltrackGetPayload<null>;
}
