import { DepartmentResponseDto } from "../dto/department/department.response.dto";
import { SemesterBasic } from "../../schemaTypes/types";
import { SemesterResponseDto } from "../dto/semester/semester.response.dto";

export const toJsonSemester = (semester: SemesterBasic,): SemesterResponseDto => {


  return {
    year : semester.year,
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
  }
}