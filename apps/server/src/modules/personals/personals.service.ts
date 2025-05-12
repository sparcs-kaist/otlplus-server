import { Injectable } from '@nestjs/common';
import { PersonalsRepository } from '@src/prisma/repositories/personal.repository';

@Injectable()
export class PersonalsService {
  constructor(private readonly personalsRepository: PersonalsRepository) {}
}
