import { ISemester } from '@otl/server-nest/common/interfaces'

import { ESemester } from '@otl/prisma-client/entities'

export const toJsonSemester = (semester: ESemester.Basic): ISemester.Response => ({
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
})
