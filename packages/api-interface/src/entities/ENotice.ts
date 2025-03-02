import { Prisma } from '@prisma/client';

export namespace ENotice {
  export const Basic = Prisma.validator<Prisma.support_noticeDefaultArgs>()({});

  export type Basic = Prisma.support_noticeGetPayload<typeof Basic>;
}
