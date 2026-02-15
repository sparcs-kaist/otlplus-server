import { Injectable } from '@nestjs/common'

import { PrismaService } from '@otl/prisma-client/prisma.service'

import { ESchedules } from '../entities/ESchedules'

@Injectable()
export class ScheduleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSchedules(): Promise<ESchedules.SchedulesResponse> {
    const schedules = await this.prisma.schedules.findMany()
    return { schedules }
  }
}
