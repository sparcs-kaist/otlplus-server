import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { Prisma, PrismaClient } from '@prisma/client'

import { signalExtension } from './custom-prisma-client'

@Injectable()
export class PrismaReadService extends PrismaClient implements OnModuleInit {
  constructor(
    @Inject('ORM_OPTIONS') ormOption: Prisma.PrismaClientOptions,
    @Inject('ORM_READ_OPTIONS') ormReadOption?: Prisma.PrismaClientOptions,
  ) {
    if (ormReadOption) {
      super(ormReadOption)
    }
    else {
      super(ormOption)
    }
  }

  async onModuleInit() {
    await this.$connect()
    // // @ts-ignore
    // this.$on('query', (e:any) => {
    //   console.log(`Query: ${e.query}`)
    //   console.log(`Params: ${e.params}`)
    //   console.log(`Duration: ${e.duration}ms`)
    // })
    const extendedClient = this.$extends(signalExtension)
    Object.assign(this, extendedClient)
  }
}
