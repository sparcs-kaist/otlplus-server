import { Injectable } from '@nestjs/common'
import { ISemester } from '@otl/server-nest/common/interfaces'

import { orderFilter } from '@otl/prisma-client/common/util'
import { SemesterRepository } from '@otl/prisma-client/repositories'

@Injectable()
export class SemestersService {
  constructor(private readonly semesterRepository: SemesterRepository) {}

  async getSemesters(order: ISemester.QueryDto) {
    const orderBy = orderFilter(order.order)
    const semesters = await this.semesterRepository.getSemesters({
      orderBy,
    })
    return semesters
  }
}
