import { Prisma } from '@prisma/client';
export declare namespace ECourse {
  const Basic: {};
  type Basic = Prisma.subject_courseGetPayload<typeof Basic>;
  const Extended: {
    include: {
      subject_department: true;
      subject_course_professors: {
        include: {
          professor: true;
        };
      };
    };
  };
  type Extended = Prisma.subject_courseGetPayload<typeof Extended>;
  const Details: {
    include: {
      lecture: true;
      subject_department: true;
      subject_course_professors: {
        include: {
          professor: true;
        };
      };
    };
  };
  type Details = Prisma.subject_courseGetPayload<typeof Details>;
  const DetailWithIsRead: {
    include: {
      subject_courseuser: true;
      lecture: true;
      subject_department: true;
      subject_course_professors: {
        include: {
          professor: true;
        };
      };
    };
  };
  type DetailWithIsRead = Prisma.subject_courseGetPayload<typeof DetailWithIsRead>;
  namespace ECourseUser {
    const Basic: {};
    type Basic = Prisma.subject_courseuserGetPayload<typeof Basic>;
  }
}
