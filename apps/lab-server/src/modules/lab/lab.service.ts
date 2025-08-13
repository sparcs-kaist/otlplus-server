import { Inject, Injectable } from '@nestjs/common'
import { LAB_REPOSITORY, LabRepository } from '@otl/lab-server/modules/lab/domain/lab.repository'

@Injectable()
export class LabService {
  constructor(
    @Inject(LAB_REPOSITORY)
    private readonly labRepository: LabRepository,
  ) {}
}
