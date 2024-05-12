import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IPrismaMiddleware } from 'src/common/interfaces/IPrismaMiddleware';
import settings from '../settings';
import { mediator } from './middleware/mediator';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
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
      const signal = mediator(this, params);
      if (signal.signal) {
        if (signal.IsPre) {
          const s: IPrismaMiddleware.IPrismaMiddleware<true> = signal.signal;
          const execute = await s.execute(params);
          if (!execute) {
            throw new Error('Middleware Error');
          }
          return next(params);
        } else {
          const result = await next(params);
          const s: IPrismaMiddleware.IPrismaMiddleware<false> = signal.signal;
          const execute = await s.execute(params, result);
          if (!execute) {
            throw new Error('Middleware Error');
          }
          return result;
        }
      }
      return next(params);
    });
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
