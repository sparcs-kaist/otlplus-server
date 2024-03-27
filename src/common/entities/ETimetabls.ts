import { Prisma } from '@prisma/client';

export namespace ETimetable {
  export const WithLectureClasstimes =
    Prisma.validator<Prisma.timetable_timetable_lecturesArgs>()({
      include: {
        subject_lecture: {
          include: {
            subject_classtime: true,
          },
        },
      },
    });

  export type WithLectureClasstimes =
    Prisma.timetable_timetable_lecturesGetPayload<typeof WithLectureClasstimes>;
}
