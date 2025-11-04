import { Controller, Get } from '@nestjs/common'
import { Public } from '@otl/server-nest/common/decorators/skip-auth.decorator'
import { ISchedules } from '@otl/server-nest/common/interfaces'
import { toJsonSchedules } from '@otl/server-nest/common/serializer/schedule.serializer'

import { SchedulesService } from './schedules.service'

@Controller('api/v2/schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  @Public()
  async getSchedules(): Promise<ISchedules.Basic[]> {
    const schedules = await this.schedulesService.getSchedules()
    return schedules.map((schedule) => toJsonSchedules(schedule))
  }
}
