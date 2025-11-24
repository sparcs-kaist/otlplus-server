import { IsArray, IsOptional } from 'class-validator'

import { OrderDefaultValidator, PROHIBITED_FIELD_PATTERN } from './validators.decorator'

export namespace ISemester {
  export class QueryDto {
    @IsOptional()
    @IsArray()
    @OrderDefaultValidator(PROHIBITED_FIELD_PATTERN)
    order?: string[]
  }

  export interface Response {
    year: number
    semester: number
    beginning: Date
    end: Date
    courseRegistrationPeriodStart: Date | null
    courseRegistrationPeriodEnd: Date | null
    courseAddDropPeriodEnd: Date | null
    courseDropDeadline: Date | null
    courseEvaluationDeadline: Date | null
    gradePosting: Date | null
    courseDesciptionSubmission: Date | null
  }

  export interface ResponseV2 {
    semesters: Response[]
  }
}
