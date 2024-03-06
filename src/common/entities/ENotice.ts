import { Prisma } from '@prisma/client';

export namespace ENotice {
  export const Basic = Prisma.validator<Prisma.support_noticeArgs>()({});

  export type Basic = Prisma.support_noticeGetPayload<typeof Basic>;
}
