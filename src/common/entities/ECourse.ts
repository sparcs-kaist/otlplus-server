import { Prisma } from '@prisma/client';

export namespace ECourse {
  export const Basic = Prisma.validator<Prisma.subject_courseArgs>()({});
  export type Basic = Prisma.subject_courseGetPayload<typeof Basic>;

  export const Extended = Prisma.validator<Prisma.subject_courseArgs>()({
    include: {
      subject_department: true,
      subject_course_professors: { include: { professor: true } },
    },
  });
  export type Extended = Prisma.subject_courseGetPayload<typeof Extended>;

  export const Details = Prisma.validator<Prisma.subject_courseArgs>()({
    include: {
      ...Extended.include
      lecture: true,
      subject_courseuser: true,
    },
  });
  export type Details = Prisma.subject_courseGetPayload<typeof Details>;
}
