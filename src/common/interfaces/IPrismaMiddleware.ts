import { Prisma } from '@prisma/client';

export namespace IPrismaMiddleware {
  type IsPre = true;
  export interface IPrismaMiddleware<T extends boolean> {
    execute: T extends IsPre
      ? (params: Prisma.MiddlewareParams) => Promise<boolean>
      : (params: Prisma.MiddlewareParams, result: any) => Promise<boolean>;
    //getInstance:(prisma: PrismaService) => IPrismaMiddleware<boolean>;
  }
}
