import { Department } from '@otl/server-nest/modules/departments/domain/department'

export class Professor {
  id!: number

  professorName!: string

  professorNameEn!: string | null

  professorId!: number

  major!: number | null

  score!: ProfessorScore
}

export class ProfessorScore {
  gradeSum!: number

  loadSum!: number

  speechSum!: number

  reviewTotalWeight!: number

  grade!: number

  load!: number

  speech!: number
}

export type ProfessorRelationMap = {
  major: Department
}

export type ProfessorWithRelations<T extends keyof ProfessorRelationMap = never> = Professor &
  Pick<ProfessorRelationMap, T>
export type ProfessorBasic = ProfessorWithRelations
export type ProfessorWithDepartment = ProfessorWithRelations<'major'>
