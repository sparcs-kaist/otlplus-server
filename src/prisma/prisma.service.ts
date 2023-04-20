import { INestApplication, Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from '@prisma/client';
import settings from "../settings";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const ormOption = settings().ormconfig();
    super(ormOption);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
