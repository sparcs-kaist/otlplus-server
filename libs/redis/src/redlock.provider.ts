import { Provider } from '@nestjs/common'
import { REDIS_CLIENT } from '@otl/redis/redis.provider'
import Redis from 'ioredis'
import Redlock from 'redlock'

export const REDLOCK = Symbol('REDLOCK')

export const redlockProvider: Provider = {
  provide: REDLOCK,
  inject: [REDIS_CLIENT],
  useFactory: (redisClient: Redis) => new Redlock([redisClient], {
    retryDelay: 200,
    retryCount: 5,
  }),
}
