import { ESemester } from '@otl/api-interface/src/entities/ESemester';
import { ISemester } from '@otl/api-interface/src/interfaces/ISemester';

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
