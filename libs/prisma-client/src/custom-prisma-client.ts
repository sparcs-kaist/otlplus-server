import { Prisma } from '@prisma/client'

import { mediator } from '@otl/prisma-client/middleware'

export const signalExtension = Prisma.defineExtension((client) => client.$extends({
  name: 'signal',
  query: {
    $allModels: {
      async $allOperations({
        model, operation, args, query,
      }) {
        const signal = mediator(model)
        if (signal) {
          const preExecute = await signal.preExecute(operation, args)
          if (!preExecute) {
            throw new Error('Middleware Error')
          }
          const result = await query(args)
          const postExecute = await signal.postExecute(operation, args, result)
          if (!postExecute) {
            throw new Error('Middleware Error')
          }
          return result
        }
        return query(args)
      },
    },
  },
}))
