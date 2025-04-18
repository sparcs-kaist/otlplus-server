import { Module } from '@nestjs/common'

import { AuthChain } from './auth.chain'
import { AuthConfig } from './auth.config'
import { IsPublicCommand } from './command/isPublic.command'
import { SyncApiKeyCommand } from './command/syncApiKey.command'

@Module({
  imports: [],
  controllers: [],
  providers: [AuthChain, IsPublicCommand, SyncApiKeyCommand, AuthConfig],
  exports: [AuthConfig, AuthChain],
})
export class AuthModule {}
