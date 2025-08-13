import { Professor } from './professor'

export const PROFESSOR_REPOSITORY = Symbol('PROFESSOR_REPOSITORY')
export interface ProfessorRepository {
  insert(data: Professor): Promise<void>
  searchByNameAndDepartment(name: string, department: string): Promise<Professor[]>
  searchByEidOrOrcidOrRid(id: string): Promise<Professor[]>
  deleteById(id: string): Promise<void>
}
