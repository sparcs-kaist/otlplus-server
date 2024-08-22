import { Prisma } from '@prisma/client';

export namespace EUser {
  export const Basic = Prisma.validator<Prisma.session_userprofileArgs>()({});
  export type Basic = Prisma.session_userprofileGetPayload<typeof Basic>;
}
