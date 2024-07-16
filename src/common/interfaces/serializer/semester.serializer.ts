import { ESemester } from 'src/common/entities/ESemester';
import { SemesterResponseDto } from '../dto/semester/semester.response.dto';

export const toJsonSemester = (
  semester: ESemester.Basic,
): SemesterResponseDto => {
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
