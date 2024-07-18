// import { Prisma, PrismaClient } from '@prisma/client';

import { Prisma } from '@prisma/client';
import { mediator } from './middleware/mediator';

export const signalExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    name: 'signal',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          console.log(model);
          console.log(operation);
          console.log('args');
          console.log(args);
          console.log(query.toString());

          const signal = mediator(model);
          if (signal) {
            const preExecute = await signal.preExecute(operation, args);
            if (!preExecute) {
              throw new Error('Middleware Error');
            }
            const result = await query(args);
            const postExecute = await signal.postExecute(
              operation,
              args,
              result,
            );
            if (!postExecute) {
              throw new Error('Middleware Error');
            }
            return result;
          }
          return query(args);
        },
      },
    },
  });
});
// export const customPrismaClient = (
//   prismaClient: PrismaClient,
// )=> {
//   return prismaClient.$extends(signalExtension);
// };

// export class PrismaClientExtended extends PrismaClient {
//   customPrismaClient!: CustomPrismaClient;

//   get client() {
// 		if(!this.customPrismaClient) {
// 			this.customPrismaClient = customPrismaClient(this);
// 		}

// 		return this.customPrismaClient;
// 	}
// }

// export type CustomPrismaClient = ReturnType<typeof customPrismaClient>;
