import {
  Inject, Injectable, OnModuleInit, Optional,
} from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

import { PrismaConnectionOptions } from './prisma.config'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(@Optional() @Inject('ORM_OPTIONS') ormOptions?: PrismaConnectionOptions) {
    const datasourceUrl = ormOptions?.datasourceUrl ?? process.env.DATABASE_URL

    super({
      ...(datasourceUrl ? { datasourceUrl } : {}),
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'stdout',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'info',
        },
        // {
        //   emit: 'stdout',
        //   level: 'warn',
        // },
      ],
      errorFormat: 'pretty',
    })
  }

  async onModuleInit() {
    await this.$connect()
    // // @ts-ignore
    // this.$on('query', (e:any) => {
    //   console.log(`Query: ${e.query}`)
    //   console.log(`Params: ${e.params}`)
    //   console.log(`Duration: ${e.duration}ms`)
    // })
    console.log('Prisma connected successfully')
    // const extendedClient = this.$extends(signalExtension)
    // Object.assign(this, extendedClient)
  }

  async onModuleDestroy() {
    console.log('Closing Prisma connection...')
    await this.$disconnect()
  }
}
