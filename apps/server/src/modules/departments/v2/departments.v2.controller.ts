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
  async getDepartmentOptions(): Promise<IDepartmentV2.Response> {
    const departments = await this.departmentsService.getDepartmentOptions()
    return {
      undergraduate: departments.undergraduate.map((department) => toJsonDepartment(department)),
      recent: departments.recent.map((department) => toJsonDepartment(department)),
      other: departments.other.map((department) => toJsonDepartment(department)),
    }
  }
}
