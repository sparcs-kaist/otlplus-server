import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { ReviewMiddleware } from './prisma.reviews';
import { ReviewVoteMiddleware } from './prisma.reviewvote';

export const mediator = (
  prisma: PrismaService,
  params: Prisma.MiddlewareParams,
) => {
  if (params.model === 'review_review') {
    return new ReviewMiddleware(prisma);
  } else if (params.model === 'review_reviewvote') {
    return new ReviewVoteMiddleware(prisma);
  }
  return null;
};
