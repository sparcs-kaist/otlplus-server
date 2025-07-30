import { Module } from '@nestjs/common'

import { redisProvider, redisSubscriberProvider } from './redis.provider'

@Module({
  providers: [redisProvider, redisSubscriberProvider],
  exports: [redisProvider, redisSubscriberProvider],
})
export class RedisModule {}
