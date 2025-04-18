import { IPrismaMiddleware } from './IPrismaMiddleware';
import { PrismaService } from '@otl/prisma-client/prisma.service';

export class SemesterMiddleware implements IPrismaMiddleware.IPrismaMiddleware {
  private static instance: SemesterMiddleware;
  private prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  async preExecute(operations: IPrismaMiddleware.operationType, args: any): Promise<boolean> {
    return true;
  }

  async postExecute(operations: IPrismaMiddleware.operationType, args: any, result: any): Promise<boolean> {
    if (operations === 'create') {
      //todo: cache delete
    }
    return true;
  }

  static initialize(prisma: PrismaService) {
    if (!SemesterMiddleware.instance) {
      SemesterMiddleware.instance = new SemesterMiddleware(prisma);
    }
  }

  static getInstance(): SemesterMiddleware {
    return SemesterMiddleware.instance;
  }
}
