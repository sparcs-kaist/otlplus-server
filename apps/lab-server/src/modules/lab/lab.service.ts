import { Injectable } from '@nestjs/common'
import { LabRepository } from '@otl/weaviate-client/repositories/lab.repository'

@Injectable()
export class LabService {
  constructor(private readonly labRepository: LabRepository) {}
}
