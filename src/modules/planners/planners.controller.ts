import { Controller, Get, Query } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { PlannerRequestDtoDefault } from 'src/common/interfaces/dto/planner/planner.request.dto';
import { PlannersService } from './planners.service';

@Controller('api/users/:id/planners')
export class PlannersController {
  constructor(private readonly plannersService: PlannersService) {}

  @Get()
  async getPlanners(
    @Query() query: PlannerRequestDtoDefault,
    @GetUser() user: session_userprofile,
  ) {
    const planners = await this.plannersService.getPlannerByUser(query, user);
    return planners;
  }
}
