export class Semester {
  id?: number

  year!: number

  semester!: number
}

export class SemesterSchedule {
  beginning!: Date

  end!: Date

  courseRegistrationPeriodStart!: Date | null

  courseRegistrationPeriodEnd!: Date | null

  courseAddDropPeriodEnd!: Date | null

  courseDropDeadline!: Date | null

  courseEvaluationDeadline!: Date | null

  gradePosting!: Date | null

  courseDesciptionSubmission!: Date | null
}
