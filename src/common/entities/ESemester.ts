import { Prisma } from '@prisma/client';

export namespace ESemester {
  export const Basic = Prisma.validator<Prisma.subject_semesterArgs>()({});
  export type Basic = Prisma.subject_semesterGetPayload<typeof Basic>;
}
