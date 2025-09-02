import { Injectable } from '@nestjs/common'
import { Prisma, subject_semester } from '@prisma/client'

import { PrismaService } from '@otl/prisma-client/prisma.service'
import { ESemester } from '../entities'

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

  async getNotWritableSemester(): Promise<subject_semester | null> {
    const now = new Date()
    return await this.prisma.subject_semester.findFirst({
      where: {
        OR: [{ courseAddDropPeriodEnd: { gte: now } }, { beginning: { gte: now } }],
      },
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

  async findSemesterByDate(date: Date): Promise<ESemester.Basic> {
    // TODO: index 추가 필요
    return this.prisma.subject_semester.findFirstOrThrow({
      where: {
        beginning: { lte: date },
        end: { gte: date },
      },
    })
  }
}
