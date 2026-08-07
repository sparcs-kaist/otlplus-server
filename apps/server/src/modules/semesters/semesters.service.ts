import { Injectable } from '@nestjs/common'
import { ISemester } from '@otl/server-nest/common/interfaces'
import { subject_semester } from '@prisma/client'

import { orderFilter } from '@otl/prisma-client/common/util'
import { SemesterRepository } from '@otl/prisma-client/repositories'

@Injectable()
export class SemestersService {
  constructor(private readonly semesterRepository: SemesterRepository) {}

  async getCurrentSemester(): Promise<subject_semester> {
    const currentTime = new Date()
    const semesters = await this.semesterRepository.getSemesters({
      orderBy: [{ year: 'desc' }, { semester: 'desc' }],
      take: 5,
    })
    // 현재 시간에 해당하는 학기가 있는 경우
    let currentSemester = semesters.find((semester) => {
      const beginning = new Date(semester.beginning)
      const end = new Date(semester.end)
      return beginning <= currentTime && currentTime <= end
    })

    // 현재 시간에 해당하는 학기가 없는 경우 ( 학기가 끝났는데, 그 다음 학기를 추가하지 않은 경우 and 추가를 했는데 아직 시작하지 않은 경우 )
    // end가 현재 시간보다 전인 가장 최근 케이스
    if (!currentSemester) {
      currentSemester = semesters.find((semester) => {
        const end = new Date(semester.end)
        return end <= currentTime
      }) ?? semesters[0]
    }
    return currentSemester
  }

  async getSemesters(order: ISemester.QueryDto) {
    const orderBy = orderFilter(order.order)
    const semesters = await this.semesterRepository.getSemesters({
      orderBy,
    })
    return semesters
  }

  public getSemesterName(semester: subject_semester, language: string = 'ko'): string {
    const seasons = language.includes('en') ? ['spring', 'summer', 'fall', 'winter'] : ['봄', '여름', '가을', '겨울']

    const seasonName = seasons[semester.semester - 1]
    return `${semester.year} ${seasonName}`
  }
}
