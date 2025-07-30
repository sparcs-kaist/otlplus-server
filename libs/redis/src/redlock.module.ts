import { Module } from '@nestjs/common'

import { RedisModule } from './redis.module'
import { redlockProvider } from './redlock.provider'

@Module({
  // Import your module that provides the Redis client
  imports: [RedisModule],
  providers: [redlockProvider],
  exports: [redlockProvider],
})
export class RedlockModule {}
