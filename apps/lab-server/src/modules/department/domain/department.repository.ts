import { Department } from './department'

export const DEPARTMENT_REPOSITORY = Symbol('DEPARTMENT_REPOSITORY')
export interface DepartmentRepository {
  insert(data: Department): Promise<void>
  searchByName(name: string): Promise<Department[]>
  deleteById(id: string): Promise<void>
}
