import { Injectable } from '@nestjs/common'

import { PersonalsRepository } from '@otl/prisma-client/repositories/personal.repository'

@Injectable()
export class PersonalsService {
  constructor(private readonly personalsRepository: PersonalsRepository) {}
}
