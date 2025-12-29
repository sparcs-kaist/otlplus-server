import { Controller, Get } from '@nestjs/common'
import { GetLanguage, Language } from '@otl/server-nest/common/decorators/get-language.decorator'
import { Public } from '@otl/server-nest/common/decorators/skip-auth.decorator'
import { IDepartmentV2 } from '@otl/server-nest/common/interfaces/v2'
import { toJsonDepartmentV2 } from '@otl/server-nest/common/serializer/v2/department.serializer'

import { DepartmentsServiceV2 } from './departments.service'

@Controller('api/v2/department-options')
export class DepartmentsControllerV2 {
  constructor(private readonly departmentsService: DepartmentsServiceV2) {}

  @Get()
  @Public()
  async getDepartmentOptions(@GetLanguage() language: Language): Promise<IDepartmentV2.Response> {
    const { undergraduate, recent, other } = await this.departmentsService.getDepartmentOptions()
    return {
      departments: [...undergraduate, ...recent, ...other].map((department) => toJsonDepartmentV2(department, language)),
    }
  }
}
