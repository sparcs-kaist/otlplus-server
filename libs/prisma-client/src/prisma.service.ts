import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '@prisma/client'
import type { PoolConfig } from 'mariadb'

function resolveConfig(ormOpt?: PoolConfig | string): PoolConfig {
  const urlStr = typeof ormOpt === 'string' ? ormOpt : process.env.DATABASE_URL || ''
  if (urlStr) {
    try {
      const u = new URL(urlStr)
      return {
        host: u.hostname || 'mariadb',
        port: Number(u.port || 3306),
        user: decodeURIComponent(u.username || '') || process.env.DB_USER || 'otl',
        password: decodeURIComponent(u.password || '') || process.env.DB_PASSWORD || 'supersecret',
        database: (u.pathname || '').slice(1) || process.env.DB_DATABASE || 'otldb',
        connectionLimit: 10,
        acquireTimeout: 20000,
        connectTimeout: 8000,
        socketTimeout: 8000,
      }
    }
    catch (err) {
      // 잘못된 DATABASE_URL은 무시하고 아래 fallback 경로로 진행
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[Prisma] Invalid DATABASE_URL:', (err as Error)?.message)
      }
      // no-op (의도적 무시)
    }
  }
  if (ormOpt && typeof ormOpt === 'object') {
    return {
      host: 'mariadb',
      port: 3306,
      user: 'otl',
      password: 'supersecret',
      database: 'otldb',
      connectionLimit: 10,
      acquireTimeout: 20000,
      connectTimeout: 8000,
      socketTimeout: 8000,
      ...ormOpt,
    }
  }
  return {
    host: process.env.DB_HOST || 'mariadb',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'otl',
    password: process.env.DB_PASSWORD || 'supersecret',
    database: process.env.DB_DATABASE || 'otldb',
    connectionLimit: 10,
    acquireTimeout: 20000,
    connectTimeout: 8000,
    socketTimeout: 8000,
  }
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(@Inject('ORM_OPTIONS') ormOption: PoolConfig | string) {
    const cfg = resolveConfig(ormOption)
    console.log('Prisma WRITE pool cfg =>', { ...cfg, password: '***' })
    console.log('[PRISMA WRITE ENV]', {
      DATABASE_URL: process.env.DATABASE_URL,
      PRISMA_DATABASE_URL: process.env.PRISMA_DATABASE_URL,
      PRISMA_READ_URL: process.env.PRISMA_READ_URL,
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_USER: process.env.DB_USER,
      DB_DATABASE: process.env.DB_DATABASE,
    })
    console.log('[PRISMA WRITE DI]', ormOption)
    console.log('[PRISMA WRITE FINAL CFG]', { ...cfg, password: '***' })
    // ⬇️ 여기서도 "설정"을 직접 넘긴다
    const adapter = new PrismaMariaDb(cfg)

    super({
      adapter,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'info' },
      ],
      errorFormat: 'pretty',
    })
  }

  async onModuleInit() {
    await this.$connect()
    console.log('Prisma connected successfully')
  }
}
