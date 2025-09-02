import { Injectable } from '@nestjs/common'
import { ISemester } from '@otl/server-nest/common/interfaces'
import { subject_semester } from '@prisma/client'

import { orderFilter } from '@otl/prisma-client/common/util'
import { SemesterRepository } from '@otl/prisma-client/repositories'

@Injectable()
export class SemestersService {
  constructor(private readonly semesterRepository: SemesterRepository) {}

  async getSemesters(order: ISemester.QueryDto): Promise<ISemester.Response[]> {
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

  async getSemesterByDate(date?: Date): Promise<ISemester.Response> {
    const now = date ?? new Date()
    const semester = await this.semesterRepository.findSemesterByDate(now)
    return semester
  }

  async getSemesterWeek(
    date?: Date,
    semesterInfo?: ISemester.Response,
  ): Promise<{
    semester: ISemester.Response
    week: number // 1주차 ~ 16주차
  }> {
    const now = date ?? new Date()
    const semester = semesterInfo ?? (await this.semesterRepository.findSemesterByDate(now))
    const oneWeek = 1000 * 60 * 60 * 24 * 7
    const nowTime = now.getTime()
    const semesterWeek = Math.floor((nowTime - semester.beginning.getTime()) / oneWeek) + 1
    return { semester, week: semesterWeek }
  }
}
