import { Injectable, InternalServerErrorException } from '@nestjs/common'
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
    const now = new Date()
    const currentYear = now.getFullYear()
    const semesters = await this.semesterRepository.getSemestersInYearRange(currentYear - 1, currentYear + 1)
    const isRegular = (semester: subject_semester) => semester.semester === 1 || semester.semester === 3
    const regular = [...semesters].reverse().find((s) => isRegular(s) && s.beginning <= now)

    if (!regular) {
      const fallback = await this.semesterRepository.getFallbackSemester(now)
      if (!fallback) throw new InternalServerErrorException('No semester in DB')
      return fallback
    }

    // 정규학기 종료 시각까지는 현재 정규학기를 유지합니다.
    if (now <= regular.end) return regular

    const seasonal = semesters.find((s) => s.year === regular.year && s.semester === regular.semester + 1)
    if (seasonal?.courseAddDropPeriodEnd && now <= seasonal.courseAddDropPeriodEnd) return seasonal

    // 배열은 연도·학기 오름차순이므로 가장 가까운 다음 정규학기를 선택합니다.
    const nextRegular = semesters.find(
      (s) => isRegular(s) && (s.year > regular.year || (s.year === regular.year && s.semester > regular.semester)),
    )
    return nextRegular ?? regular
  }
}
