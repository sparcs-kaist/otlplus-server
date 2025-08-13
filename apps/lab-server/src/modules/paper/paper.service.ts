import { Inject, Injectable } from '@nestjs/common'
import { PAPER_REPOSITORY, PaperRepository } from '@otl/lab-server/modules/paper/domain/paper.repository'

@Injectable()
export class PaperService {
  constructor(
    @Inject(PAPER_REPOSITORY)
    private readonly paperRepository: PaperRepository,
  ) {}
}
