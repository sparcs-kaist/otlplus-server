import { Prisma } from '@prisma/client';
export declare namespace ELecture {
  const Basic: {};
  type Basic = Prisma.subject_lectureGetPayload<typeof Basic>;
  const Extended: {
    include: {
      subject_department: true;
      subject_lecture_professors: {
        include: {
          professor: true;
        };
      };
    };
  };
  type Extended = Prisma.subject_lectureGetPayload<typeof Extended>;
  const WithClasstime: {
    include: {
      subject_classtime: true;
    };
  };
  type WithClasstime = Prisma.subject_lectureGetPayload<typeof WithClasstime>;
  const UserTaken: {
    include: {
      subject_classtime: true;
      subject_department: true;
    };
  };
  type UserTaken = Prisma.subject_lectureGetPayload<typeof UserTaken>;
  const Details: {
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
  type Details = Prisma.subject_lectureGetPayload<typeof Details>;
  const DetailsWithCourse: {
    include: {
      course: true;
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
  type DetailsWithCourse = Prisma.subject_lectureGetPayload<typeof DetailsWithCourse>;
  function isDetails(lecture: ELecture.Extended | ELecture.Details): lecture is ELecture.Details;
}
