import { Lab } from '@otl/lab-server/modules/lab/domain/lab'

export const LAB_REPOSITORY = Symbol('LAB_REPOSITORY')
export interface LabRepository {
  insert(data: Lab): Promise<void>
  findById(id: string): Promise<any | null>
  findByProfName(name: string): Promise<any[]>
  deleteById(id: string): Promise<any>
}
