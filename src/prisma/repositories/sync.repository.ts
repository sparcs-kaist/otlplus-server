import { Injectable } from '@nestjs/common';
import { ESemester } from 'src/common/entities/ESemester';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SyncRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getDefaultSemester(): Promise<ESemester.Basic | null> {
    const now = new Date();
    return await this.prisma.subject_semester.findFirst({
      where: { courseDesciptionSubmission: { lt: now } },
      orderBy: { courseDesciptionSubmission: 'desc' },
    });
  }
}
