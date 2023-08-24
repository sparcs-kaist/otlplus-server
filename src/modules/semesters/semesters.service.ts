import { Injectable } from '@nestjs/common';
import { SemesterRepository } from 'src/prisma/repositories/semester.repository';
import { orderFilter } from "../../common/utils/search.utils";
import { SemesterQueryDto } from "../../common/interfaces/dto/semester/semester.request.dto";

@Injectable()
export class SemestersService {
  constructor(
    private readonly semesterRepository: SemesterRepository,
  ) {
  }

  async getSemesters(order: SemesterQueryDto) {
    const orderBy = orderFilter(order.order);
    const semesters = await this.semesterRepository.getSemesters({ orderBy: orderBy });
    return semesters;
  }
}
