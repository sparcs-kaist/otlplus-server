import { Paper } from '@otl/lab-server/modules/paper/domain/paper'

export const PAPER_REPOSITORY = Symbol('PAPER_REPOSITORY')
export interface PaperRepository {
  insert(data: Paper): Promise<void>
  searchByTitle(title: string): Promise<Paper[]>
  findByProfName(name: string): Promise<Paper[]>
}
