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
import { toJsonPlannerItem } from '../../common/interfaces/serializer/planner.item.serializer';
import { PlannersService } from './planners.service';

@Controller('api/users/:id/planners')
export class PlannersController {
  constructor(private readonly plannersService: PlannersService) {}

  @Get()
  async getPlanners(
    @Query() query: IPlanner.QueryDto,
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
    @Body() planner: IPlanner.CreateBodyDto,
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
    @Body() removeItem: IPlanner.RemoveItemBodyDto,
    @Param('plannerId') plannerId: number,
    @GetUser() user: session_userprofile,
  ): Promise<IPlanner.Detail> {
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
      item.course,
    );
    return futureItem;
  }

  @Post(':plannerId/reorder')
  async reorderPlanner(
    @Body() reorder: IPlanner.ReorderBodyDto,
    @Param('plannerId') plannerId: number,
    @GetUser() user: session_userprofile,
  ): Promise<IPlanner.Detail> {
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
    @Body() updateItemDto: IPlanner.UpdateItemBodyDto,
  ) {
    if (userId !== user.id) {
      throw new UnauthorizedException();
    }

    const updatedItem = await this.plannersService.updatePlannerItem(
      plannerId,
      updateItemDto,
    );
    return toJsonPlannerItem(updatedItem, updateItemDto.item_type);
  }
}
