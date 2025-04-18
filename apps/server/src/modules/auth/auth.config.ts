import { Injectable } from '@nestjs/common'
import { IsReviewProhibitedCommand } from '@otl/server-nest/modules/auth/command/isReviewProhibited.command'

import { AuthChain } from './auth.chain'
import { IsPublicCommand } from './command/isPublic.command'
import { JwtCommand } from './command/jwt.command'
import { SidCommand } from './command/sid.command'
import { SyncApiKeyCommand } from './command/syncApiKey.command'

@Injectable()
export class AuthConfig {
  constructor(
    private authChain: AuthChain,
    private readonly jwtCommand: JwtCommand,
    private readonly sidCommand: SidCommand,
    private readonly isPublicCommand: IsPublicCommand,
    private readonly syncApiKeyCommand: SyncApiKeyCommand,
    private readonly isReviewProhibitedCommand: IsReviewProhibitedCommand,
  ) {}

  public async config(env: string) {
    if (env === 'local') return this.getLocalGuardConfig()
    if (env === 'dev') return this.getDevGuardConfig()
    if (env === 'prod') return this.getProdGuardConfig()
    return this.getProdGuardConfig()
  }

  private getLocalGuardConfig = () => this.authChain
    .register(this.isPublicCommand)
    .register(this.sidCommand)
    .register(this.jwtCommand)
    .register(this.syncApiKeyCommand)
    .register(this.isReviewProhibitedCommand)

  private getDevGuardConfig = () => this.authChain
    .register(this.isPublicCommand)
    .register(this.sidCommand)
    .register(this.jwtCommand)
    .register(this.syncApiKeyCommand)
    .register(this.isReviewProhibitedCommand)

  private getProdGuardConfig = () => this.authChain
    .register(this.jwtCommand)
    .register(this.isPublicCommand)
    .register(this.syncApiKeyCommand)
    .register(this.isReviewProhibitedCommand)
}
