import { ESemester } from '@otl/prisma-client/entities';
import { ISemester } from '@otl/server-nest/common/interfaces';

export const toJsonSemester = (semester: ESemester.Basic): ISemester.Response => {
  return {
    year: semester.year,
    semester: semester.semester,
    beginning: semester.beginning,
    end: semester.end,
    courseDesciptionSubmission: semester.courseDesciptionSubmission,
    courseRegistrationPeriodStart: semester.courseRegistrationPeriodStart,
    courseRegistrationPeriodEnd: semester.courseRegistrationPeriodEnd,
    courseAddDropPeriodEnd: semester.courseAddDropPeriodEnd,
    courseDropDeadline: semester.courseDropDeadline,
    courseEvaluationDeadline: semester.courseEvaluationDeadline,
    gradePosting: semester.gradePosting,
  };
};
