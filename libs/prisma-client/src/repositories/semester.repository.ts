import { Injectable } from '@nestjs/common';
import { Prisma, subject_semester } from '@prisma/client';
import { PrismaService } from '@otl/prisma-client/prisma.service';

@Injectable()
export class SemesterRepository {
  constructor(private readonly prisma: PrismaService) {}

  async existsSemester(year: number, semester: number): Promise<boolean> {
    const existsSemester: boolean = await this.prisma.subject_semester
      .findFirstOrThrow({
        where: {
          year: year,
          semester: semester,
        },
      })
      .catch((e) => false)
      .then((s) => true);
    return existsSemester;
  }

  async getSemesters(paginationAndSoring: {
    orderBy?: Prisma.subject_semesterOrderByWithRelationInput[];
    skip?: number;
    take?: number;
  }) {
    const orderBy = paginationAndSoring.orderBy;
    const skip = paginationAndSoring.skip;
    const take = paginationAndSoring.take;

    return await this.prisma.subject_semester.findMany({
      orderBy: orderBy,
      skip: skip,
      take: take,
    });
  }

  async getNotWritableSemester(): Promise<subject_semester | null> {
    const now = new Date();
    return await this.prisma.subject_semester.findFirst({
      where: {
        OR: [{ courseAddDropPeriodEnd: { gte: now } }, { beginning: { gte: now } }],
      },
    });
  }

  async findSemester(year: number, semester: number): Promise<subject_semester | null> {
    return await this.prisma.subject_semester.findUnique({
      where: {
        year_semester: {
          year: year,
          semester: semester,
        },
      },
    });
  }
}
