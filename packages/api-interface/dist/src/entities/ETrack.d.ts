import { Prisma } from '@prisma/client';
export declare namespace ETrack {
  const Major: {
    include: {
      subject_department: true;
    };
  };
  type Major = Prisma.graduation_majortrackGetPayload<typeof Major>;
  const Additional: {
    include: {
      subject_department: true;
    };
  };
  type Additional = Prisma.graduation_additionaltrackGetPayload<typeof Additional>;
  type General = Prisma.graduation_generaltrackGetPayload<null>;
}
