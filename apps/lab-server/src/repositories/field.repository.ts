export interface FieldData {
  id: string
  keyword: string
  parentField?: string
}

export interface FieldRepositoryInterface {
  insert(data: FieldData): Promise<void>
  searchByPrefix(prefix: string): Promise<FieldData[]>
  deleteById(id: string): Promise<void>
}
