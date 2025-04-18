import { IPrismaMiddleware } from './IPrismaMiddleware';
import { PrismaService } from '@otl/prisma-client/prisma.service';

export class DepartmentMiddleware implements IPrismaMiddleware.IPrismaMiddleware {
  private static instance: DepartmentMiddleware;
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
    if (!DepartmentMiddleware.instance) {
      DepartmentMiddleware.instance = new DepartmentMiddleware(prisma);
    }
  }

  static getInstance(): DepartmentMiddleware {
    return DepartmentMiddleware.instance;
  }
}
