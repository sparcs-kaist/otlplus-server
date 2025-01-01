import { Prisma } from '@prisma/client';

export namespace ETakenLecture {
  export const Basic =
    Prisma.validator<Prisma.session_userprofile_taken_lecturesDefaultArgs>()(
      {},
    );

  export type Basic = Prisma.session_userprofile_taken_lecturesGetPayload<
    typeof Basic
  >;
}
