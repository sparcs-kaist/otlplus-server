import { Injectable } from '@nestjs/common'

import { ScheduleRepository } from '@otl/prisma-client/repositories'

@Injectable()
export class SchedulesService {
  constructor(private readonly scheduleRepository: ScheduleRepository) {}

  async getSchedules() {
    const schedules = await this.scheduleRepository.getSchedules()
    return schedules
  }
}
