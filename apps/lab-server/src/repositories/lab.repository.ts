export interface LabData {
  id: string
  name: string
  prof: string
  department: string
  keywords: string[]
  location?: string
}

export interface LabRepositoryInterface {
  insert(data: any): Promise<void>
  findById(id: string): Promise<any | null>
  findByProfName(name: string): Promise<any[]>
  deleteById(id: string): Promise<any>
}
