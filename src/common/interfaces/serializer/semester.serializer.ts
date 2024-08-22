import { ESemester } from 'src/common/entities/ESemester';
import { ISemester } from '../ISemester';

export const toJsonSemester = (
  semester: ESemester.Basic,
): ISemester.Response => {
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
