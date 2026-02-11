import { Injectable } from '@nestjs/common'

import { PrismaService } from '@otl/prisma-client/prisma.service'

@Injectable()
export class NoticesRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async getNotices(date: Date) {
    return await this.prisma.support_notice.findMany({
      where: { start_time: { lte: date }, end_time: { gte: date } },
    })
  }
}
