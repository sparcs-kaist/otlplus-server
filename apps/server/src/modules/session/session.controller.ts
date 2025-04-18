import { Body, Controller, Get, Post } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator';
import { DepartmentsService } from '../departments/departments.service';
import { SessionService } from './session.service';
import { IDepartment, ISession, IUser } from '@otl/server-nest/common/interfaces';
import { toJsonDepartment } from '@otl/server-nest/common/serializer/department.serializer';
import { toJsonUser } from '@otl/server-nest/common/serializer/user.serializer';

@Controller('session')
export class SessionController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly departmentsService: DepartmentsService,
  ) {}

  @Get('department-options')
  async departmentOptions(): Promise<IDepartment.Basic[][]> {
    const { undergraduate, recent, other } = await this.departmentsService.getDepartmentOptions();
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
  ): Promise<IUser.Basic> {
    const departmentIds = body.fav_department.map((id) => parseInt(id));
    const result = await this.sessionService.changeFavoriteDepartments(user.id, departmentIds);
    return toJsonUser(result);
  }
}
