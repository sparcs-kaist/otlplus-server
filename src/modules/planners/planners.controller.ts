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
import { IPlanner } from 'src/common/interfaces/IPlanner';
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

  @Post(':plannerId/add-arbitrary-item')
  async addArbitraryItem(
    @Param('id') id: number,

    @Param('plannerId') plannerId: number,
    @Body() item: IPlanner.AddArbitraryItemDto,
    @GetUser() user: session_userprofile,
  ) {
    if (id !== user.id) throw new UnauthorizedException();

    const newPlanner = await this.plannersService.addArbitraryItem(
      plannerId,
      item,
      user,
    );
    return newPlanner;
  }
}

// https://github.com/sparcs-kaist/otlplus/blob/8086f13604f0832fbfc3fd5fa977d61a60c311d5/apps/planner/views.py
