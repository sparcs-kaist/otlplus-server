import { Controller, Get } from '@nestjs/common'
import { Public } from '@otl/server-nest/common/decorators/skip-auth.decorator'
import { IDepartmentV2 } from '@otl/server-nest/common/interfaces/v2/IDepartmentV2'
import { toJsonDepartment } from '@otl/server-nest/common/serializer/department.serializer'

import { DepartmentsService } from './departments.v2.service'

@Controller('api/v2/department-options')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @Public()
  async getDepartmentOptions(): Promise<IDepartmentV2.Basic[][]> {
    const { undergraduate, recent, other } = await this.departmentsService.getDepartmentOptions()
    return [
      undergraduate.map((e) => toJsonDepartment(e)),
      recent.map((e) => toJsonDepartment(e)),
      other.map((e) => toJsonDepartment(e)),
    ]
  }
}
