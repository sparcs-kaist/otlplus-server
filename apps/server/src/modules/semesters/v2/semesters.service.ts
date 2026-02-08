import { Injectable } from '@nestjs/common'
import { subject_semester } from '@prisma/client'

import { SemesterRepository } from '@otl/prisma-client/repositories'

@Injectable()
export class SemestersServiceV2 {
  constructor(private readonly semesterRepository: SemesterRepository) {}

  async getSemesters() {
    const semesters = await this.semesterRepository.getSemesters({})
    return semesters
  }

  async getCurrentSemester(): Promise<subject_semester> {
    const currentTime = new Date()
    const semesters = await this.semesterRepository.getSemesters({
      orderBy: [{ year: 'desc' }, { semester: 'desc' }],
      take: 5,
    })

    // Case 1: 현재 시간이 학기 기간 내에 있는 경우 (beginning <= now <= end)
    const activeSemester = semesters.find((semester) => {
      const beginning = new Date(semester.beginning)
      const end = new Date(semester.end)
      return beginning <= currentTime && currentTime <= end
    })
    if (activeSemester) return activeSemester

    // Case 2: 학기 사이의 gap 기간 - 이전 학기가 끝났으면 다음 학기를 반환
    const upcomingSemester = semesters.find((s) => new Date(s.beginning) > currentTime)
    if (upcomingSemester) {
      const pastSemesterExists = semesters.some((s) => new Date(s.end) < currentTime)
      if (pastSemesterExists) return upcomingSemester
    }

    // Case 3: Fallback - 다음 학기가 없는 경우, 가장 최근 종료된 학기 반환
    return semesters.find((s) => new Date(s.end) <= currentTime) ?? semesters[0]
  }
}
