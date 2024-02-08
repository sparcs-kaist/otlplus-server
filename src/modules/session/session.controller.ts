import { Controller, Get } from '@nestjs/common';
import { toJsonDepartment } from 'src/common/interfaces/serializer/department.serializer';
import { DepartmentsService } from '../departments/departments.service';

@Controller('session')
export class SessionController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get('department-options')
  async departmentOptions() {
    const { undergraduate, recent, other } =
      await this.departmentsService.getDepartmentOptions();
    return [
      undergraduate.map((e) => toJsonDepartment(e)),
      recent.map((e) => toJsonDepartment(e)),
      other.map((e) => toJsonDepartment(e)),
    ];
  }
}
