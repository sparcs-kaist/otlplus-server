import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

import { FriendsController } from './friends.controller'
import { FriendsService } from './friends.service'

@Module({
  imports: [JwtModule.register({})],
  controllers: [FriendsController],
  providers: [FriendsService],
})
export class FriendsModule {}
