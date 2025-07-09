import { Injectable } from '@nestjs/common'
import { Prisma, subject_semester } from '@prisma/client'

import { PrismaReadService } from '@otl/prisma-client/prisma.read.service'
import { PrismaService } from '@otl/prisma-client/prisma.service'

@Injectable()
export class SemesterRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  async existsSemester(year: number, semester: number): Promise<boolean> {
    const existsSemester: boolean = await this.prismaRead.subject_semester
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

    return await this.prismaRead.subject_semester.findMany({
      orderBy,
      skip,
      take,
    })
  }

  async getNotWritableSemester(): Promise<subject_semester | null> {
    const now = new Date()
    return await this.prismaRead.subject_semester.findFirst({
      where: {
        OR: [{ courseAddDropPeriodEnd: { gte: now } }, { beginning: { gte: now } }],
      },
    })
  }

  async findSemester(year: number, semester: number): Promise<subject_semester | null> {
    return await this.prismaRead.subject_semester.findUnique({
      where: {
        year_semester: {
          year,
          semester,
        },
      },
    })
  }
}
