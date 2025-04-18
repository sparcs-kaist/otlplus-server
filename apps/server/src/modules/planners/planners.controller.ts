import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, UnauthorizedException,
} from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { IPlanner } from '@otl/server-nest/common/interfaces'
import { PlannerPipe } from '@otl/server-nest/common/pipe/planner.pipe'
import { toJsonPlannerItem } from '@otl/server-nest/common/serializer/planner.item.serializer'
import { toJsonPlanner } from '@otl/server-nest/common/serializer/planner.serializer'
import { session_userprofile } from '@prisma/client'

import { PlannersService } from './planners.service'

@Controller('api/users/:id/planners')
export class PlannersController {
  constructor(private readonly plannersService: PlannersService) {}

  @Get()
  async getPlanners(
    @Query() query: IPlanner.QueryDto,
    @Param('id') id: number,
    @GetUser() user: session_userprofile,
  ): Promise<IPlanner.Detail[]> {
    if (id !== user.id) {
      throw new UnauthorizedException()
    }
    const planners = await this.plannersService.getPlannerByUser(query, user)
    return planners
  }

  @Patch(':plannerId')
  async updatePlanner(
    @Param('plannerId', PlannerPipe) plannerId: number,
    @Body() planner: IPlanner.UpdateBodyDto,
    @GetUser() user: session_userprofile,
  ): Promise<IPlanner.Detail> {
    if (planner.should_update_taken_semesters) {
      await this.plannersService.updateTakenLectures(user, plannerId, planner.start_year, planner.end_year)
    }
    const updatedPlanner = await this.plannersService.updatePlanner(plannerId, planner, user)
    return toJsonPlanner(updatedPlanner)
  }

  @Delete(':plannerId')
  async deletePlanner(@Param('plannerId', PlannerPipe) plannerId: number, @GetUser() _user: session_userprofile) {
    await this.plannersService.deletePlanner(plannerId)
    return { message: 'Planner deleted' }
  }

  @Post()
  async postPlanner(
    @Body() planner: IPlanner.CreateBodyDto,
    @Param('id') id: number,
    @GetUser() user: session_userprofile,
  ): Promise<IPlanner.Detail> {
    if (id !== user.id) {
      throw new UnauthorizedException()
    }
    const newPlanner = await this.plannersService.postPlanner(planner, user)
    return newPlanner
  }

  @Post(':plannerId/add-arbitrary-item')
  async addArbitraryItem(
    @Param('id') id: number,

    @Param('plannerId') plannerId: number,
    @Body() item: IPlanner.AddArbitraryItemDto,
    @GetUser() user: session_userprofile,
  ): Promise<IPlanner.IItem.Arbitrary> {
    if (id !== user.id) throw new UnauthorizedException()

    const newPlanner = await this.plannersService.addArbitraryItem(plannerId, item, user)
    return newPlanner
  }

  @Post(':plannerId/remove-item')
  async removePlanner(
    @Body() removeItem: IPlanner.RemoveItemBodyDto,
    @Param('plannerId') plannerId: number,
    @GetUser() user: session_userprofile,
  ): Promise<IPlanner.Detail> {
    return await this.plannersService.removePlannerItem(plannerId, removeItem, user)
  }

  @Post(':plannerId/add-future-item')
  async addFutureItem(
    @Body() item: IPlanner.FuturePlannerItemDto,
    @Param('id') userId: number,
    @Param('plannerId') plannerId: number,
    @GetUser() user: session_userprofile,
  ): Promise<IPlanner.IItem.Future> {
    if (userId !== user.id) {
      throw new UnauthorizedException()
    }
    const futureItem = await this.plannersService.createFuturePlannerItem(
      plannerId,
      item.year,
      item.semester,
      item.course,
    )
    return futureItem
  }

  @Post(':plannerId/reorder')
  async reorderPlanner(
    @Body() reorder: IPlanner.ReorderBodyDto,
    @Param('plannerId') plannerId: number,
    @GetUser() user: session_userprofile,
  ): Promise<IPlanner.Detail> {
    return await this.plannersService.reorderPlanner(plannerId, reorder.arrange_order, user)
  }

  @Post(':plannerId/update-item')
  async updatePlannerItem(
    @Param('id') userId: number,
    @Param('plannerId') plannerId: number,
    @GetUser() user: session_userprofile,
    @Body() updateItemDto: IPlanner.UpdateItemBodyDto,
  ): Promise<IPlanner.IItem.IMutate> {
    if (userId !== user.id) {
      throw new UnauthorizedException()
    }

    const updatedItem = await this.plannersService.updatePlannerItem(plannerId, updateItemDto)
    return toJsonPlannerItem(updatedItem, updateItemDto.item_type)
  }
}
