import { Department } from '@otl/server-nest/modules/departments/domain/department'
import { Lecture } from '@otl/server-nest/modules/lectures/domain/lecture'

export class Course {
  id!: number

  oldCode!: string

  newCode!: string

  departmentId!: number

  type!: string

  typeEn!: string

  title!: string

  titleEn!: string

  summary!: string

  score!: CourseScore | null

  latestWrittenDatetime!: Date | null

  titleNoSpace!: string

  titleEnNoSpace!: string
}

export class CourseScore {
  gradeSum!: number

  loadSum!: number

  speechSum!: number

  reviewTotalWeight!: number

  grade!: number

  load!: number

  speech!: number
}

export type CourseRelationMap = {
  department: Department
}

export type CourseWithRelations<T extends keyof CourseRelationMap = never> = Lecture & Pick<CourseRelationMap, T>

export type CourseBasic = CourseWithRelations

export type CourseWithDepartment = CourseWithRelations<'department'>
