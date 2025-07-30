import { DynamicModule, Module } from '@nestjs/common'
import { REDLOCK_OPTIONS, RedlockModuleOptions } from '@otl/redis/redlock.interface'

import { RedisModule } from './redis.module'
import { redlockProvider } from './redlock.provider'

@Module({})
export class RedlockModule {
  static register(options: RedlockModuleOptions): DynamicModule {
    return {
      module: RedlockModule,
      imports: [RedisModule],
      providers: [
        {
          provide: REDLOCK_OPTIONS,
          useValue: options,
        },
        redlockProvider,
      ],
      exports: [redlockProvider],
    }
  }
}
