import { Prisma } from '@prisma/client';
import { IPrismaMiddleware } from 'src/common/interfaces/IPrismaMiddleware';
import { PrismaService } from '../prisma.service';

export class SemesterMiddleware
  implements IPrismaMiddleware.IPrismaMiddleware<false>
{
  private static instance: SemesterMiddleware;

  constructor(private prisma: PrismaService) {}

  async execute(
    params: Prisma.MiddlewareParams,
    result: any,
  ): Promise<boolean> {
    if (params.action === 'create') {
      //todo: cache delete
    }
    return true;
  }

  static getInstance(prisma: PrismaService): SemesterMiddleware {
    if (!this.instance) {
      this.instance = new SemesterMiddleware(prisma);
    }
    return this.instance;
  }
}
