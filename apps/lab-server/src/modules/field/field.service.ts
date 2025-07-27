import { Injectable } from '@nestjs/common'
import { FieldRepository } from '@otl/weaviate-client/repositories/field.repository'

@Injectable()
export class FieldService {
  constructor(private readonly fieldRepository: FieldRepository) {}
}
