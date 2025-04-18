import { Injectable } from '@nestjs/common';
import { orderFilter } from '@otl/prisma-client/common/util';
import { SemesterRepository } from '@otl/prisma-client/repositories';
import { subject_semester } from '@prisma/client';
import { ISemester } from '@otl/server-nest/common/interfaces';

@Injectable()
export class SemestersService {
  constructor(private readonly semesterRepository: SemesterRepository) {}

  async getSemesters(order: ISemester.QueryDto) {
    const orderBy = orderFilter(order.order);
    const semesters = await this.semesterRepository.getSemesters({
      orderBy: orderBy,
    });
    return semesters;
  }

  public getSemesterName(semester: subject_semester, language: string = 'kr'): string {
    const seasons = language.includes('en') ? ['spring', 'summer', 'fall', 'winter'] : ['봄', '여름', '가을', '겨울'];

    const seasonName = seasons[semester.semester - 1];
    return `${semester.year} ${seasonName}`;
  }
}
