import { Prisma } from '@prisma/client';

export namespace EDepartment {
  export const Basic = Prisma.validator<Prisma.subject_departmentDefaultArgs>()(
    {},
  );

  export type Basic = Prisma.subject_departmentGetPayload<typeof Basic>;
}
