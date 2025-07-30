import { Provider } from '@nestjs/common'
import settings from '@otl/redis/settings'
import Redis from 'ioredis'

export const REDIS_CLIENT = Symbol('REDIS_CLIENT')

export const redisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: () => {
    const redisConfig = settings().getRedisConfig()
    return new Redis(redisConfig)
  },
}
