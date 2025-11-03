import { Controller, Get } from '@nestjs/common'
import { Public } from '@otl/server-nest/common/decorators/skip-auth.decorator'
import { ISemester } from '@otl/server-nest/common/interfaces'
import { toJsonSemester } from '@otl/server-nest/common/serializer/semester.serializer'

import { SemestersService } from './semesters.v2.service'

@Controller('api/v2/semesters')
export class SemestersController {
  constructor(private readonly semestersService: SemestersService) {}

  @Get()
  @Public()
  async getSemesters(): Promise<ISemester.Response[]> {
    const semesters = await this.semestersService.getSemesters()
    return semesters.map((semester) => toJsonSemester(semester))
  }
}
