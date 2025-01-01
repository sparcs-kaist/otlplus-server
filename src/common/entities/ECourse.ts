import { Prisma } from '@prisma/client';

export namespace ECourse {
  export const Basic = Prisma.validator<Prisma.subject_courseDefaultArgs>()({});
  export type Basic = Prisma.subject_courseGetPayload<typeof Basic>;

  export const Extended = Prisma.validator<Prisma.subject_courseDefaultArgs>()({
    include: {
      subject_department: true,
      subject_course_professors: { include: { professor: true } },
    },
  });
  export type Extended = Prisma.subject_courseGetPayload<typeof Extended>;

  export const Details = Prisma.validator<Prisma.subject_courseDefaultArgs>()({
    include: {
      ...Extended.include,
      lecture: true,
    },
  });
  export type Details = Prisma.subject_courseGetPayload<typeof Details>;

  export const DetailWithIsRead =
    Prisma.validator<Prisma.subject_courseDefaultArgs>()({
      include: {
        ...Details.include,
        subject_courseuser: true,
      },
    });
  export type DetailWithIsRead = Prisma.subject_courseGetPayload<
    typeof DetailWithIsRead
  >;

  export namespace ECourseUser {
    export const Basic = Prisma.validator<Prisma.subject_courseDefaultArgs>()(
      {},
    );
    export type Basic = Prisma.subject_courseuserGetPayload<typeof Basic>;
  }
}
