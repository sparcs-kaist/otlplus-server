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
  PlannerRemoveItemDto,
  PlannerReorderDto,
  PlannerUpdateItemDto,
} from 'src/common/interfaces/dto/planner/planner.request.dto';
import { PlannerResponseDto } from 'src/common/interfaces/dto/planner/planner.response.dto';
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

  @Post(':plannerId/remove-item')
  async removePlanner(
    @Body() removeItem: PlannerRemoveItemDto,
    @Param('plannerId') plannerId: number,
    @GetUser() user: session_userprofile,
  ): Promise<PlannerResponseDto> {
    return await this.plannersService.removePlannerItem(
      plannerId,
      removeItem,
      user,
    );
  }

  @Post(':plannerId/add-future-item')
  async addFutureItem(
    @Body() item: IPlanner.FuturePlannerItemDto,
    @Param('id') userId: number,
    @Param('plannerId') plannerId: number,
    @GetUser() user: session_userprofile,
  ) {
    if (userId !== user.id) {
      throw new UnauthorizedException();
    }
    const futureItem = await this.plannersService.createFuturePlannerItem(
      plannerId,
      item.year,
      item.semester,
      item.courseId,
    );
    return futureItem;
  }

  @Post(':plannerId/reorder')
  async reorderPlanner(
    @Body() reorder: PlannerReorderDto,
    @Param('plannerId') plannerId: number,
    @GetUser() user: session_userprofile,
  ): Promise<PlannerResponseDto> {
    return await this.plannersService.reorderPlanner(
      plannerId,
      reorder.arrange_order,
      user,
    );
  }

  @Post(':plannerId/update-item')
  async updatePlanner(
    @Param('id') userId: number,
    @Param('plannerId') plannerId: number,
    @GetUser() user: session_userprofile,
    @Body() updateItemDto: PlannerUpdateItemDto,
  ) {
    if (userId !== user.id) {
      throw new UnauthorizedException();
    }

    return await this.plannersService.updatePlannerItem(
      plannerId,
      updateItemDto,
    );
  }
}
