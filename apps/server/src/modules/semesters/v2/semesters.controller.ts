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
  async getSemesters(): Promise<ISemester.ResponseV2> {
    const semesters = await this.semestersService.getSemesters()
    return { semesters: semesters.map((semester) => toJsonSemester(semester)) }
  }

  // Buddy팀 요청에 따른 API로, 이전 학기가 종료되면 다음 예정 학기를 던져줍니다
  @Get('/current')
  @Public()
  async getCurrentSemester(): Promise<ISemester.Response> {
    const semester = await this.semestersService.getCurrentSemester()
    return toJsonSemester(semester)
  }
}
