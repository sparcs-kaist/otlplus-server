import { Department } from '@otl/server-nest/modules/departments/domain/department'

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

export type CourseWithRelations<T extends keyof CourseRelationMap = never> = Course & Pick<CourseRelationMap, T>

export type CourseBasic = CourseWithRelations<never>

export type CourseWithDepartment = CourseWithRelations<'department'>
