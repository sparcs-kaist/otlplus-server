import { Provider } from '@nestjs/common'
import settings from '@otl/redis/settings'
import Redis from 'ioredis'

export const REDIS_CLIENT = Symbol('REDIS_CLIENT')
export const REDIS_SUBSCRIBER_CLIENT = Symbol('REDIS_SUBSCRIBER_CLIENT')

export const redisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: () => {
    const redisConfig = settings().getRedisConfig()
    return new Redis(redisConfig)
  },
}

export const redisSubscriberProvider: Provider = {
  provide: REDIS_SUBSCRIBER_CLIENT,
  useFactory: () => {
    const redisConfig = settings().getRedisConfig()
    // 완전히 새로운, 두 번째 Redis 클라이언트 인스턴스를 생성
    return new Redis(redisConfig)
  },
}
