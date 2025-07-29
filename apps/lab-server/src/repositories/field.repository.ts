import { FieldData } from '@otl/lab-server/modules/field/domain/FieldData'

export interface FieldRepositoryInterface {
  insert(data: FieldData): Promise<void>
  searchByPrefix(prefix: string): Promise<FieldData[]>
  deleteById(id: string): Promise<void>
}
