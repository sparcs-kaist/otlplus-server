import { PrismaService } from '@otl/prisma-client/prisma.service'

import { IPrismaMiddleware } from './IPrismaMiddleware'

export class SemesterMiddleware implements IPrismaMiddleware.Middleware {
  private static instance: SemesterMiddleware

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
    if (!SemesterMiddleware.instance) {
      SemesterMiddleware.instance = new SemesterMiddleware(prisma)
    }
  }

  static getInstance(): SemesterMiddleware {
    return SemesterMiddleware.instance
  }
}
