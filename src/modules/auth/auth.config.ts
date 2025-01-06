import { Injectable } from '@nestjs/common';
import { AuthChain } from './auth.chain';
import { IsPublicCommand } from './command/isPublic.command';
import { JwtCommand } from './command/jwt.command';
import { SidCommand } from './command/sid.command';
import { SyncApiKeyCommand } from './command/syncApiKey.command';
import { IsReviewProhibitedCommand } from '@src/modules/auth/command/isReviewProhibited.command';

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
    if (env == 'local') return this.getLocalGuardConfig();
    if (env == 'dev') return this.getDevGuardConfig();
    if (env == 'prod') return this.getProdGuardConfig();
    else return this.getProdGuardConfig();
  }

  private getLocalGuardConfig = () => {
    return this.authChain
      .register(this.isPublicCommand)
      .register(this.sidCommand)
      .register(this.jwtCommand)
      .register(this.syncApiKeyCommand)
      .register(this.isReviewProhibitedCommand);
  };

  private getDevGuardConfig = () => {
    return this.authChain
      .register(this.isPublicCommand)
      .register(this.sidCommand)
      .register(this.jwtCommand)
      .register(this.syncApiKeyCommand)
      .register(this.isReviewProhibitedCommand);
  };

  private getProdGuardConfig = () => {
    return this.authChain
      .register(this.jwtCommand)
      .register(this.isPublicCommand)
      .register(this.syncApiKeyCommand)
      .register(this.isReviewProhibitedCommand);
  };
}
