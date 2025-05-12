import { Prisma } from '@prisma/client';
export declare namespace ETimetable {
  type Basic = Prisma.timetable_timetableGetPayload<null>;
  const Details: {
    include: {
      timetable_timetable_lectures: {
        include: {
          subject_lecture: {
            include: {
              subject_department: true;
              subject_lecture_professors: {
                include: {
                  professor: true;
                };
              };
              subject_classtime: true;
              subject_examtime: true;
            };
          };
        };
      };
    };
  };
  type Details = Prisma.timetable_timetableGetPayload<typeof Details>;
  const WithLectureClasstimes: {
    include: {
      subject_lecture: {
        include: {
          subject_classtime: true;
        };
      };
    };
  };
  type WithLectureClasstimes = Prisma.timetable_timetable_lecturesGetPayload<typeof WithLectureClasstimes>;
}
