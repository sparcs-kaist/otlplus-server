import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import settings from '../settings';
import { signalExtension } from './custom-prisma-client';

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
    const extendedClient = this.$extends(signalExtension);
    Object.assign(this, extendedClient);

    // this.$use(async (params, next) => {
    //   console.log('params');
    //   console.log(params);
    //   if("data" in params.args){
    //     if("timetable_timetable_lectures" in params.args.data){
    //       console.log(params.args.data.timetable_timetable_lectures);
    //     }
    //   }
    //   const signal = mediator(this, params.model);
    //   if (signal) {;
    //       const execute = await signal.preExecute(params.action, params.args);
    //       if (!execute) {
    //         throw new Error('Middleware Error');
    //       }
    //       return next(params);
    //     } else {
    //       const result = await next(params);
    //       const s: IPrismaMiddleware.IPrismaMiddleware<false> = signal.signal;
    //       const execute = await s.execute(params, result);
    //       if (!execute) {
    //         throw new Error('Middleware Error');
    //       }
    //       return result;
    //     }
    //   }
    //   return next(params);
    // });
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
