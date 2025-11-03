import { Injectable } from '@nestjs/common'

import { SemesterRepository } from '@otl/prisma-client/repositories'

@Injectable()
export class SemestersService {
  constructor(private readonly semesterRepository: SemesterRepository) {}

  async getSemesters() {
    const semesters = await this.semesterRepository.getSemesters({})
    return semesters
  }
}
