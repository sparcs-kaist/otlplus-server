import { Controller, Get, Query } from '@nestjs/common';
import { SemesterQueryDto } from '../../common/interfaces/dto/semester/semester.request.dto';
import { toJsonSemester } from '../../common/interfaces/serializer/semester.serializer';
import { SemestersService } from './semesters.service';

@Controller('api/semesters')
export class SemestersController {
  constructor(private readonly semestersService: SemestersService) {}

  @Get()
  async getSemesters(@Query() query: SemesterQueryDto) {
    const semesters = await this.semestersService.getSemesters(query);
    return semesters.map((semester) => toJsonSemester(semester));
  }
}
