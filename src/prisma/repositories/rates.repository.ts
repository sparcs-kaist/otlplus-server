import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RateRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getRate(userId: number, year: number, version: string) {
    return this.prisma.support_rate.findFirst({
      where: {
        user_id: userId,
        year,
        version,
      },
    });
  }

  async createRate(
    userId: number,
    score: number,
    year: number,
    version: string,
  ) {
    return this.prisma.support_rate.create({
      data: {
        user_id: userId,
        year,
        score,
        version,
      },
    });
  }
}
