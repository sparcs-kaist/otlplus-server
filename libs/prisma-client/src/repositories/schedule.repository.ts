import { Injectable } from '@nestjs/common'

import { PrismaReadService } from '@otl/prisma-client/prisma.read.service'
import { PrismaService } from '@otl/prisma-client/prisma.service'

import { ESchedules } from '../entities/ESchedules'

@Injectable()
export class ScheduleRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  async getSchedules(): Promise<ESchedules.SchedulesResponse> {
    const schedules = await this.prismaRead.schedules.findMany()
    return { schedules }
  }
}
