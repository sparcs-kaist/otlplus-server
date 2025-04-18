import { Controller, Get, Query } from '@nestjs/common'
import { Public } from '@otl/server-nest/common/decorators/skip-auth.decorator'
import { ISemester } from '@otl/server-nest/common/interfaces'
import { toJsonSemester } from '@otl/server-nest/common/serializer/semester.serializer'

import { SemestersService } from './semesters.service'

@Controller('api/semesters')
export class SemestersController {
  constructor(private readonly semestersService: SemestersService) {}

  @Get()
  @Public()
  async getSemesters(@Query() query: ISemester.QueryDto): Promise<ISemester.Response[]> {
    const semesters = await this.semestersService.getSemesters(query)
    return semesters.map((semester) => toJsonSemester(semester))
  }
}
