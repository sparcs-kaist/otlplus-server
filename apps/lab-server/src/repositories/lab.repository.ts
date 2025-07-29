import { LabData } from '@otl/lab-server/modules/lab/domain/LabData'

export interface LabRepositoryInterface {
  insert(data: LabData): Promise<void>
  findById(id: string): Promise<any | null>
  findByProfName(name: string): Promise<any[]>
  deleteById(id: string): Promise<any>
}
