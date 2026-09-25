import { Module } from '@nestjs/common'
import { RedisModule } from '@nestjs-modules/ioredis'
import settings from '@otl/server-nest/settings'

import { FriendCodeRateLimitGuard } from './friend-code-rate-limit.guard'
import { FriendsController } from './friends.controller'
import { FriendsService } from './friends.service'

@Module({
  imports: [RedisModule.forRootAsync({
    useFactory: () => {
      const { url, password } = settings().getRedisConfig()
      return {
        type: 'single',
        url,
        options: {
          password,
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
          connectTimeout: 2000,
          commandTimeout: 2000,
        },
      }
    },
  }, 'friends')],
  controllers: [FriendsController],
  providers: [FriendsService, FriendCodeRateLimitGuard],
})
export class FriendsModule {}
