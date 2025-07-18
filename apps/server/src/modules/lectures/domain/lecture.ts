import { Course } from '@otl/server-nest/modules/courses/domain/course'
import { Department } from '@otl/server-nest/modules/departments/domain/department'
import { ProfessorBasic } from '@otl/server-nest/modules/professor/domain/professor'
import { Semester } from '@otl/server-nest/modules/semesters/domain/semester'

export class Lecture {
  id!: number

  code!: string

  oldCode!: string

  newCode!: string

  departmentId!: number | null

  classNo!: string

  title!: string

  titleEn!: string

  type!: string

  typeEn!: string

  audience!: number

  credit!: number

  numClasses!: number

  numLabs!: number

  creditAu!: number

  limit!: number

  numPeople!: number | null

  isEnglish!: boolean

  deleted!: boolean

  courseId!: number | null

  semester!: Semester | null

  score!: LectureScore | null

  generatedTitle!: LectureGenerateTitle | null
}

export class LectureScore {
  gradeSum!: number

  loadSum!: number

  speechSum!: number

  grade!: number

  load!: number

  speech!: number

  reviewTotalWeight!: number
}

export class LectureGenerateTitle {
  classTitle!: string | null

  classTitleEn!: string | null

  commonTitle!: string | null

  commonTitleEn!: string | null

  titleNoSpace!: string

  titleEnNoSpace!: string
}

export type LectureRelationMap = {
  department: Department
  course: Course
  professors: ProfessorBasic[]
}

export type LectureWithRelations<T extends keyof LectureRelationMap = never> = Lecture & Pick<LectureRelationMap, T>

export type LectureBasic = LectureWithRelations
export type LectureWithCourse = LectureWithRelations<'course'>
export type LectureWithDepartment = LectureWithRelations<'department'>
export type LectureWithCourseAndDepartment = LectureWithRelations<'course' | 'department'>
export type LectureWithProfessors = LectureWithRelations<'professors'>
export type FullLecture = LectureWithRelations<'department' | 'course'>
