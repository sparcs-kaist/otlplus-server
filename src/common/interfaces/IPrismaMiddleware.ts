export namespace IPrismaMiddleware {
  // type IsPre = true;

  // export interface IPrismaMiddleware<T extends boolean> {
  //   execute: T extends IsPre
  //     ? (params: Prisma.MiddlewareParams) => Promise<boolean>
  //     : (params: Prisma.MiddlewareParams, result: any) => Promise<boolean>;
  //   getInstance:(prisma: PrismaService) => IPrismaMiddleware<boolean>;
  // }

  export type operationType =
    | 'findUnique'
    | 'findFirst'
    | 'findUniqueOrThrow'
    | 'findFirstOrThrow'
    | 'findMany'
    | 'create'
    | 'createMany'
    | 'delete'
    | 'update'
    | 'deleteMany'
    | 'updateMany'
    | 'upsert'
    | 'aggregate'
    | 'groupBy'
    | 'count';
  export interface IPrismaMiddleware {
    preExecute: (operations: operationType, args: any) => Promise<boolean>;

    postExecute: (
      operations: operationType,
      args: any,
      result: any,
    ) => Promise<boolean>;
  }
}
