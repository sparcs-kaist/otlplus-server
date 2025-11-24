import { Controller, Get } from '@nestjs/common'
import { Public } from '@otl/server-nest/common/decorators/skip-auth.decorator'
import { ISemester } from '@otl/server-nest/common/interfaces'
import { toJsonSemester } from '@otl/server-nest/common/serializer/semester.serializer'

import { SemestersServiceV2 } from './semesters.service'

@Controller('api/v2/semesters')
export class SemestersControllerV2 {
  constructor(private readonly semestersService: SemestersServiceV2) {}

  @Get()
  @Public()
  async getSemesters(): Promise<{ semesters: ISemester.Response[] }> {
    const semesters = await this.semestersService.getSemesters()
    return { semesters: semesters.map((semester) => toJsonSemester(semester)) }
  }
}
