import { Prisma } from '@prisma/client';
import { ELecture } from './ELecture';

export namespace ETimetable {
  export const Details = Prisma.validator<Prisma.timetable_timetableArgs>()({
    include: {
      timetable_timetable_lectures: {
        include: {
          subject_lecture: ELecture.Details,
        },
      },
    },
  });

  export type Details = Prisma.timetable_timetableGetPayload<typeof Details>;

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
