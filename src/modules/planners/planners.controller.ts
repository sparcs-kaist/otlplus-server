import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import {
  PlannerBodyDto,
  PlannerQueryDto,
} from 'src/common/interfaces/dto/planner/planner.request.dto';
import { PlannersService } from './planners.service';

@Controller('api/users/:id/planners')
export class PlannersController {
  constructor(private readonly plannersService: PlannersService) {}

  @Get()
  async getPlanners(
    @Query() query: PlannerQueryDto,
    @Param('id') id: number,
    @GetUser() user: session_userprofile,
  ) {
    if (id !== user.id) {
      throw new UnauthorizedException();
    }
    const planners = await this.plannersService.getPlannerByUser(query, user);
    return planners;
  }

  @Post()
  async postPlanner(
    @Body() planner: PlannerBodyDto,
    @Param('id') id: number,
    @GetUser() user: session_userprofile,
  ) {
    if (id !== user.id) {
      throw new UnauthorizedException();
    }
    const newPlanner = await this.plannersService.postPlanner(planner, user);
    return newPlanner;
  }
}
