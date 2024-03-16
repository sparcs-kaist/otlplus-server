import { Prisma, PrismaClient } from '@prisma/client';
import { ReviewMiddleware } from './prisma.reviews';

export const middlewareConstructor = (
  prisma: PrismaClient,
  params: Prisma.MiddlewareParams,
) => {
  console.log('!!!!');
  // Do something before the request is handled by Prisma Client
  if (params.model === Prisma.ModelName.review_review) {
    return new ReviewMiddleware(prisma);
  }
};
