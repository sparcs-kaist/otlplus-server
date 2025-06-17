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
