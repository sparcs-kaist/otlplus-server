import { Provider } from '@nestjs/common'
import { REDIS_CLIENT } from '@otl/redis/redis.provider'
import { REDLOCK_OPTIONS, RedlockModuleOptions } from '@otl/redis/redlock.interface'
import Redis from 'ioredis'
import Redlock from 'redlock'

export const REDLOCK = Symbol('REDLOCK')

export const redlockProvider: Provider = {
  provide: REDLOCK,
  // Redis 클라이언트와 함께 Redlock 옵션을 주입받습니다.
  inject: [REDIS_CLIENT, REDLOCK_OPTIONS],
  useFactory: (redisClient: Redis, options: RedlockModuleOptions) => new Redlock([redisClient], {
    // 주입받은 값을 사용하고, 값이 없으면 기본값을 사용합니다.
    retryDelay: options.retryDelay ?? 200,
    retryCount: options.retryCount ?? 5,
  }),
}
