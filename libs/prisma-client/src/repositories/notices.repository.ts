import { Injectable } from '@nestjs/common'

import { PrismaReadService } from '@otl/prisma-client/prisma.read.service'
import { PrismaService } from '@otl/prisma-client/prisma.service'

@Injectable()
export class NoticesRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  public async getNotices(date: Date) {
    return await this.prismaRead.support_notice.findMany({
      where: { start_time: { lte: date }, end_time: { gte: date } },
    })
  }
}
