import { Field } from '@otl/lab-server/modules/field/domain/field'

export const FIELD_REPOSITORY = Symbol('FIELD_REPOSITORY')
export interface FieldRepository {
  insert(data: Field): Promise<void>
  searchByPrefix(prefix: string): Promise<Field[]>
  deleteById(id: string): Promise<void>
}
