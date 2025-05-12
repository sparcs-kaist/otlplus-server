import { Injectable } from '@nestjs/common'
import { ISemester } from '@otl/server-nest/common/interfaces'
import { subject_semester } from '@prisma/client'

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

  public getSemesterName(semester: subject_semester, language: string = 'kr'): string {
    const seasons = language.includes('en') ? ['spring', 'summer', 'fall', 'winter'] : ['봄', '여름', '가을', '겨울']

    const seasonName = seasons[semester.semester - 1]
    return `${semester.year} ${seasonName}`
  }
}
