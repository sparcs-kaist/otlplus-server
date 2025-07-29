import { PaperData } from '@otl/lab-server/modules/paper/domain/PaperData'

export interface PaperRepositoryInterface {
  insert(data: PaperData): Promise<void>
  searchByTitle(title: string): Promise<PaperData[]>
  findByProfName(name: string): Promise<PaperData[]>
}
