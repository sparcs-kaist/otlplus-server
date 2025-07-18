import { ProfessorBasic, ProfessorScore } from '@otl/server-nest/modules/professor/domain/professor'

export const PROFESSOR_REPOSITORY = Symbol('PROFESSOR_REPOSITORY')

export interface ServerConsumerProfessorRepository {
  findProfessorsByLectureId(id: number): Promise<ProfessorBasic[]>

  updateProfessorScore(professorId: number, grades: ProfessorScore & { reviewNum: number }): Promise<ProfessorBasic>
}
