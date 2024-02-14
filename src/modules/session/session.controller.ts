import { Body, Controller, Get, Post } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { ISession } from 'src/common/interfaces/ISession';
import { toJsonDepartment } from 'src/common/interfaces/serializer/department.serializer';
import { DepartmentsService } from '../departments/departments.service';
import { SessionService } from './session.service';

@Controller('session')
export class SessionController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly departmentsService: DepartmentsService,
  ) {}

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

  @Post('favorite-departments')
  async favoriteDepartments(
    @Body() body: ISession.FavoriteDepartmentsDto,
    @GetUser() user: session_userprofile,
  ) {
    const departmentIds = body.fav_department.map((id) => parseInt(id));
    await this.sessionService.changeFavoriteDepartments(user.id, departmentIds);
  }
}
