import { PrismaService } from '@otl/prisma-client/prisma.service'

import { IPrismaMiddleware } from './IPrismaMiddleware'

export class DepartmentMiddleware implements IPrismaMiddleware.Middleware {
  private static instance: DepartmentMiddleware

  private prisma: PrismaService

  constructor(prisma: PrismaService) {
    this.prisma = prisma
  }

  async preExecute(_operations: IPrismaMiddleware.operationType, _args: any): Promise<boolean> {
    return true
  }

  async postExecute(operations: IPrismaMiddleware.operationType, _args: any, _result: any): Promise<boolean> {
    if (operations === 'create') {
      // todo: cache delete
    }
    return true
  }

  static initialize(prisma: PrismaService) {
    if (!DepartmentMiddleware.instance) {
      DepartmentMiddleware.instance = new DepartmentMiddleware(prisma)
    }
  }

  static getInstance(): DepartmentMiddleware {
    return DepartmentMiddleware.instance
  }
}
