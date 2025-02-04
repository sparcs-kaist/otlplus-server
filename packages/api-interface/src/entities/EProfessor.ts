import { Prisma } from '@prisma/client';

export namespace EProfessor {
  export const Basic = Prisma.validator<Prisma.subject_professorDefaultArgs>()(
    {},
  );
  export type Basic = Prisma.subject_professorGetPayload<typeof Basic>;
}
