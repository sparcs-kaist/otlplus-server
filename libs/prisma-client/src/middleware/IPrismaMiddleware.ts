export namespace IPrismaMiddleware {
  export type operationType =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'findMany'
    | 'create'
    | 'createMany'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'groupBy'
    | 'count'
    | 'aggregate'
  export interface Middleware {
    preExecute: (operations: operationType, args: unknown) => Promise<boolean>

    postExecute: (operations: operationType, args: unknown, result: unknown) => Promise<boolean>
  }
}
