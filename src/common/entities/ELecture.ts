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

  export const WithClasstime = Prisma.validator<Prisma.subject_lectureArgs>()({
    include: {
      subject_classtime: true,
    },
  });
  export type WithClasstime = Prisma.subject_lectureGetPayload<
    typeof WithClasstime
  >;

  // TODO: usage of UserTaken seems to be equal to WithClasstime. Check if it's necessary.
  export const UserTaken = Prisma.validator<Prisma.subject_lectureArgs>()({
    include: {
      subject_classtime: true,
      subject_department: true,
    },
  });
  export type UserTaken = Prisma.subject_lectureGetPayload<typeof UserTaken>;

  export const Details = Prisma.validator<Prisma.subject_lectureArgs>()({
    include: {
      subject_department: true,
      subject_lecture_professors: { include: { professor: true } },
      subject_classtime: true,
      subject_examtime: true,
    },
  });
  export type Details = Prisma.subject_lectureGetPayload<typeof Details>;

  export function isDetails(
    lecture: ELecture.Extended | ELecture.Details,
  ): lecture is ELecture.Details {
    return 'subject_classtime' in lecture && 'subject_examtime' in lecture;
  }
}
