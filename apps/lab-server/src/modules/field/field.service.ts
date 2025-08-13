import { Inject, Injectable } from '@nestjs/common'
import { FIELD_REPOSITORY, FieldRepository } from '@otl/lab-server/modules/field/domain/field.repository'

@Injectable()
export class FieldService {
  constructor(
    @Inject(FIELD_REPOSITORY)
    private readonly fieldRepository: FieldRepository,
  ) {}
}
