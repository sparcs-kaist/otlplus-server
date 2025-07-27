import { Injectable } from '@nestjs/common'
import { PaperRepository } from '@otl/weaviate-client/repositories/paper.repository'

@Injectable()
export class PaperService {
  constructor(private readonly paperRepository: PaperRepository) {}
}
