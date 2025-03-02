import { Prisma } from '@prisma/client';

export namespace ESync{
  export namespace History{
    export const Basic = Prisma.validator<Prisma.sync_historyDefaultArgs>()({});
    export type Basic = Prisma.sync_historyGetPayload<typeof Basic>;

  }
}