import { Controller, Get, Query } from '@nestjs/common';
import { ISemester } from 'src/common/interfaces/ISemester';
import { toJsonSemester } from '../../common/interfaces/serializer/semester.serializer';
import { SemestersService } from './semesters.service';
import { Public } from '@src/common/decorators/skip-auth.decorator';

@Controller('api/semesters')
export class SemestersController {
  constructor(private readonly semestersService: SemestersService) {}

  @Get()
  @Public()
  async getSemesters(
    @Query() query: ISemester.QueryDto,
  ): Promise<ISemester.Response[]> {
    const semesters = await this.semestersService.getSemesters(query);
    return semesters.map((semester) => toJsonSemester(semester));
  }
}
