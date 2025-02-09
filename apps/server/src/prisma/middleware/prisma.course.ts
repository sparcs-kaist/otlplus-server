import { PrismaService } from '../prisma.service';
import { IPrismaMiddleware } from '@src/prisma/middleware/IPrismaMiddleware';

export class CourseMiddleware implements IPrismaMiddleware.IPrismaMiddleware {
  private static instance: CourseMiddleware;
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
    if (!CourseMiddleware.instance) {
      CourseMiddleware.instance = new CourseMiddleware(prisma);
    }
  }

  static getInstance(): CourseMiddleware {
    return CourseMiddleware.instance;
  }
}
