import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { Prisma, PrismaClient } from '@prisma/client'

import { signalExtension } from './custom-prisma-client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(@Inject('ORM_OPTIONS') ormOption: Prisma.PrismaClientOptions) {
    super(ormOption)
  }

  async onModuleInit() {
    await this.$connect()

    const extendedClient = this.$extends(signalExtension)
    Object.assign(this, extendedClient)
  }
}
