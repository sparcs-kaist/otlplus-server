import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

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
}
