import { Prisma } from '@prisma/client';
export declare namespace EPersonal {
  const Basic: {
    include: {
      personal_timeblocks: true;
    };
  };
  type Basic = Prisma.personal_blockGetPayload<typeof Basic>;
}
