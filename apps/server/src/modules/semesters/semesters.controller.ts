import { Controller, Get, Query } from '@nestjs/common';
import { ISemester } from '@otl/api-interface/src/interfaces/ISemester';
import { SemestersService } from './semesters.service';
import { Public } from '@src/common/decorators/skip-auth.decorator';
import { toJsonSemester } from '@src/common/serializer/semester.serializer';

@Controller('api/semesters')
export class SemestersController {
  constructor(private readonly semestersService: SemestersService) {}

  @Get()
  @Public()
  async getSemesters(@Query() query: ISemester.QueryDto): Promise<ISemester.Response[]> {
    const semesters = await this.semestersService.getSemesters(query);
    return semesters.map((semester) => toJsonSemester(semester));
  }
}
