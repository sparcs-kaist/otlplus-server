import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '@prisma/client'
import * as mariadb from 'mariadb'

@Injectable()
export class PrismaReadService extends PrismaClient implements OnModuleInit {
  constructor(
    @Inject('ORM_OPTIONS') ormOption: mariadb.PoolConfig,
    @Inject('ORM_READ_OPTIONS') ormReadOption?: mariadb.PoolConfig,
  ) {
    let adapter
    if (ormReadOption) {
      adapter = new PrismaMariaDb(ormReadOption)
      console.log('Using read replica database connection')
    }
    else {
      adapter = new PrismaMariaDb(ormOption)
      console.log('Using primary database connection')
    }
    super({
      adapter,
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
    // @ts-expect-error PrismaClient에서 정의되지 않은 이벤트 처리
    this.$on('query', (e: any) => {
      console.log(`[READ] Query: ${e.query}`)
      console.log(`[READ] Params: ${e.params}`)
      console.log(`[READ] Duration: ${e.duration}ms`)
    })
    console.log('Prisma Read connected successfully')
    // const extendedClient = this.$extends(signalExtension)
    // Object.assign(this, extendedClient)
  }
}
