export namespace IPrismaMiddleware {
  export type operationType =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'findMany'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'groupBy'
    | 'count'
    | 'aggregate'
  export interface Middleware {
    preExecute: (operations: operationType, args: any) => Promise<boolean>

    postExecute: (operations: operationType, args: any, result: any) => Promise<boolean>
  }
}
