import { Injectable } from '@nestjs/common';
import { SemesterRepository } from 'src/prisma/repositories/semester.repository';
import { SemesterQueryDto } from '../../common/interfaces/dto/semester/semester.request.dto';
import { orderFilter } from '../../common/utils/search.utils';
import { subject_semester } from '@prisma/client';

@Injectable()
export class SemestersService {
  constructor(private readonly semesterRepository: SemesterRepository) {}

  async getSemesters(order: SemesterQueryDto) {
    const orderBy = orderFilter(order.order);
    const semesters = await this.semesterRepository.getSemesters({
      orderBy: orderBy,
    });
    return semesters;
  }

  public getSemesterName(
    semester: subject_semester,
    language: string = 'kr',
  ): string {
    const seasons = language.includes('en')
      ? ['spring', 'summer', 'fall', 'winter']
      : ['봄', '여름', '가을', '겨울'];

    const seasonName = seasons[semester.semester - 1];
    return `${semester.year} ${seasonName}`;
  }
}
