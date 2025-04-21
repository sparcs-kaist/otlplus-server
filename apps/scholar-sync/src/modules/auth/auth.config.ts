import { Injectable } from '@nestjs/common'

import { AuthChain } from './auth.chain'
import { IsPublicCommand } from './command/isPublic.command'
import { SyncApiKeyCommand } from './command/syncApiKey.command'

@Injectable()
export class AuthConfig {
  constructor(
    private authChain: AuthChain,
    private readonly isPublicCommand: IsPublicCommand,
    private readonly syncApiKeyCommand: SyncApiKeyCommand,
  ) {}

  public async config(env: string) {
    if (env === 'local') return this.getLocalGuardConfig()
    if (env === 'dev') return this.getDevGuardConfig()
    if (env === 'prod') return this.getProdGuardConfig()
    return this.getProdGuardConfig()
  }

  private getLocalGuardConfig = () => this.authChain.register(this.isPublicCommand).register(this.syncApiKeyCommand)

  private getDevGuardConfig = () => this.authChain.register(this.isPublicCommand).register(this.syncApiKeyCommand)

  private getProdGuardConfig = () => this.authChain.register(this.isPublicCommand).register(this.syncApiKeyCommand)
}
