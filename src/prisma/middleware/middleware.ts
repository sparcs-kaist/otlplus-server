import { Prisma, PrismaClient } from '@prisma/client';

export interface Middleware {
  execute(
    prisma: PrismaClient,
    params: Prisma.MiddlewareParams,
    next: (params: Prisma.MiddlewareParams) => Promise<any>,
  ): any;
}
