import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '@prisma/client'
import * as mariadb from 'mariadb'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(@Inject('ORM_OPTIONS') ormOption: mariadb.PoolConfig) {
    const adapter = new PrismaMariaDb(ormOption)
    super({
      adapter,
      log: [
        // {
        //   emit: 'event',
        //   level: 'query',
        // },
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
}
