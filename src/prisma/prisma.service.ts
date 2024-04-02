import {
  INestApplication,
  Inject,
  Injectable,
  OnModuleInit,
  forwardRef,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import settings from '../settings';
import { ReviewMiddleware } from './middleware/prisma.reviews';
import { middlewareConstructor } from './middleware/constructor';
import { LazyModuleLoader } from '@nestjs/core';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(
    @Inject(forwardRef(() => ReviewMiddleware))
    private readonly reviewMiddleware: ReviewMiddleware,
    private lazyModuleLoader: LazyModuleLoader,
  ) {
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
    this.$use(async (params, next) => {
      console.time('mw construct');
      const middleware = middlewareConstructor(this, params);
      console.time('mw construct');
      if (middleware) {
        await middleware.execute(this, params, next);
      }

      if (params.model === 'review_review') {
        //todo: determine reuslt type
        if (
          params.action === 'create' ||
          params.action === 'update' ||
          params.action === 'upsert'
        ) {
          const result = await next(params);
          await this.reviewMiddleware.reviewSavedMiddleware(
            result,
            params.action,
          );
          return result;
        } else if (params.action === 'delete') {
          const result = await next(params);
          await this.reviewMiddleware.reviewDeletedMiddleware(result);
          return result;
        }
      } else if (params.model === 'review_reviewvote') {
        if (
          params.action === 'create' ||
          params.action === 'update' ||
          params.action === 'upsert'
        ) {
          const result = await next(params);
          await this.reviewMiddleware.reviewVoteSavedMiddleware(result);
          return result;
        } else if (params.action === 'delete') {
          const result = await next(params);
          await this.reviewMiddleware.reviewVoteDeletedMiddleware(result);
          return result;
        }
      }
      return next(params);
    });
    //this.reviewMiddleware.reviewSavedMiddleware();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
