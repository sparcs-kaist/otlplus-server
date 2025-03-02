import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import settings from '../settings';

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
      console.log(`Query: ${e.query} ${e.params}`);
    });
  }
}
