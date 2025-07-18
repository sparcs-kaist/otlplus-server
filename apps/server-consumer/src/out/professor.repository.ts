import { ProfessorBasic } from '@otl/server-nest/modules/professor/domain/professor'

export const PROFESSOR_REPOSITORY = Symbol('PROFESSOR_REPOSITORY')

export interface ServerConsumerProfessorRepository {
  findProfessorsByLectureId(id: number): Promise<ProfessorBasic[]>
}
