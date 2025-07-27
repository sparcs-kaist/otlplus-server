export interface PaperData {
  id: string
  title: string
  prof: string
  keywords: string[]
}

export interface PaperRepositoryInterface {
  insert(data: PaperData): Promise<void>
  searchByTitle(title: string): Promise<PaperData[]>
  findByProfName(name: string): Promise<PaperData[]>
}
