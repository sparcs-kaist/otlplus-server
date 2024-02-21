import { Prisma } from '@prisma/client';

export namespace ELecture {
  export const Basic = Prisma.validator<Prisma.subject_lectureArgs>()({});
  export type Basic = Prisma.subject_lectureGetPayload<typeof Basic>;

  export const Extended = Prisma.validator<Prisma.subject_lectureArgs>()({
    include: {
      subject_department: true,
      subject_lecture_professors: { include: { professor: true } },
    },
  });
  export type Extended = Prisma.subject_lectureGetPayload<typeof Extended>;

  export const Details = Prisma.validator<Prisma.subject_lectureArgs>()({
    include: {
      subject_department: true,
      subject_lecture_professors: { include: { professor: true } },
      subject_classtime: true,
      subject_examtime: true,
    },
  });
  export type Details = Prisma.subject_lectureGetPayload<typeof Details>;
}