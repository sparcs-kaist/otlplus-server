import { Injectable } from '@nestjs/common'
import { Prisma, subject_semester } from '@prisma/client'

import { PrismaService } from '@otl/prisma-client/prisma.service'

@Injectable()
export class SemesterRepository {
  constructor(private readonly prisma: PrismaService) {}

  async existsSemester(year: number, semester: number): Promise<boolean> {
    const existsSemester: boolean = await this.prisma.subject_semester
      .findFirstOrThrow({
        where: {
          year,
          semester,
        },
      })
      .catch(() => false)
      .then(() => true)
    return existsSemester
  }

  async getSemesters(paginationAndSoring: {
    orderBy?: Prisma.subject_semesterOrderByWithRelationInput[]
    skip?: number
    take?: number
  }) {
    const { orderBy } = paginationAndSoring
    const { skip } = paginationAndSoring
    const { take } = paginationAndSoring

    return await this.prisma.subject_semester.findMany({
      orderBy,
      skip,
      take,
    })
  }

  async getSemestersInYearRange(fromYear: number, toYear: number) {
    return this.prisma.subject_semester.findMany({
      where: { year: { gte: fromYear, lte: toYear } },
      orderBy: [{ year: 'asc' }, { semester: 'asc' }],
    })
  }

  async getFallbackSemester(now: Date): Promise<subject_semester | null> {
    const endedSemester = await this.prisma.subject_semester.findFirst({
      where: { end: { lte: now } },
      orderBy: [{ year: 'desc' }, { semester: 'desc' }],
    })
    if (endedSemester) return endedSemester

    return this.prisma.subject_semester.findFirst({
      orderBy: [{ year: 'desc' }, { semester: 'desc' }],
    })
  }

  async getNotWritableSemester(): Promise<subject_semester | null> {
    const now = new Date()
    return await this.prisma.subject_semester.findFirst({
      where: {
        OR: [{ courseAddDropPeriodEnd: { gte: now } }, { beginning: { gte: now } }],
      },
    })
  }

  async getActiveSemestersAt(now: Date): Promise<Pick<subject_semester, 'year' | 'semester'>[]> {
    return this.prisma.subject_semester.findMany({
      where: { beginning: { lte: now }, end: { gte: now } },
      select: { year: true, semester: true },
    })
  }

  async findSemester(year: number, semester: number): Promise<subject_semester | null> {
    return await this.prisma.subject_semester.findUnique({
      where: {
        year_semester: {
          year,
          semester,
        },
      },
    })
  }
}
