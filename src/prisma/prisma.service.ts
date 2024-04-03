import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import settings from '../settings';
import { ReviewMiddleware } from './middleware/prisma.reviews';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() // @Inject(forwardRef(() => ReviewMiddleware))
  // private readonly reviewMiddleware: ReviewMiddleware,
  {
    const ormOption = settings().ormconfig();
    super(ormOption);
  }

  async onModuleInit() {
    await this.$connect();
    // @ts-ignore
    this.$on('query', async (e) => {
      // @ts-ignore
      // console.log(`Query: ${e.query} ${e.params}`);
    });
    const middleware = new ReviewMiddleware(this);
    this.$use(middleware.reviewVoteSavedMiddleware());
    this.$use(middleware.reviewVoteDeletedMiddleware());
    // this.$use(async (params, next) => {
    //   // if (params.model === 'review_review') {
    //   //   //todo: determine reuslt type
    //   //   if (
    //   //     params.action === 'create' ||
    //   //     params.action === 'update' ||
    //   //     params.action === 'upsert'
    //   //   ) {
    //   //     const result = await next(params);
    //   //     await this.reviewMiddleware.reviewSavedMiddleware(
    //   //       result,
    //   //       params.action,
    //   //     );
    //   //     return result;
    //   //   } else if (params.action === 'delete') {
    //   //     const result = await next(params);
    //   //     await this.reviewMiddleware.reviewDeletedMiddleware(result);
    //   //     return result;
    //   //   }
    //   // } else if (params.model === 'review_reviewvote') {
    //   //   if (
    //   //     params.action === 'create' ||
    //   //     params.action === 'update' ||
    //   //     params.action === 'upsert'
    //   //   ) {
    //   //     const result = await next(params);
    //   //     await this.reviewMiddleware.reviewVoteSavedMiddleware(result);
    //   //     return result;
    //   //   } else if (params.action === 'delete') {
    //   //     const result = await next(params);
    //   //     await this.reviewMiddleware.reviewVoteDeletedMiddleware(result);
    //   //     return result;
    //   //   }
    //   // }
    //   return next(params);
    // });
    // //this.reviewMiddleware.reviewSavedMiddleware();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
