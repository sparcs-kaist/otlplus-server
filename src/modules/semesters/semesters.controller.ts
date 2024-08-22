import { Controller, Get, Query } from '@nestjs/common';
import { ISemester } from 'src/common/interfaces/ISemester';
import { toJsonSemester } from '../../common/interfaces/serializer/semester.serializer';
import { SemestersService } from './semesters.service';

@Controller('api/semesters')
export class SemestersController {
  constructor(private readonly semestersService: SemestersService) {}

  @Get()
  async getSemesters(@Query() query: ISemester.QueryDto) {
    const semesters = await this.semestersService.getSemesters(query);
    return semesters.map((semester) => toJsonSemester(semester));
  }
}
