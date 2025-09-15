import { Injectable } from '@nestjs/common'
import { IsAdminCommand } from '@otl/server-nest/modules/auth/command/isAdmin.command'
import { IsReviewProhibitedCommand } from '@otl/server-nest/modules/auth/command/isReviewProhibited.command'
import { JwtHeaderCommand } from '@otl/server-nest/modules/auth/command/jwt.header.command'
import { SidHeaderCommand } from '@otl/server-nest/modules/auth/command/sid.header.command'
import { StudentIdHeaderCommand } from '@otl/server-nest/modules/auth/command/studentId.header.command'

import { AuthChain } from './auth.chain'
import { IsPublicCommand } from './command/isPublic.command'
import { JwtCookieCommand } from './command/jwt.cookie.command'
import { SidCookieCommand } from './command/sid.cookie.command'
import { SyncApiKeyCommand } from './command/syncApiKey.command'

@Injectable()
export class AuthConfig {
  constructor(
    private authChain: AuthChain,
    private readonly jwtCookieCommand: JwtCookieCommand,
    private readonly sidCookieCommand: SidCookieCommand,
    private readonly jwtHeaderCommand: JwtHeaderCommand,
    private readonly sidHeaderCommand: SidHeaderCommand,
    private readonly studentHeaderCommand: StudentIdHeaderCommand,
    private readonly isPublicCommand: IsPublicCommand,
    private readonly syncApiKeyCommand: SyncApiKeyCommand,
    private readonly isReviewProhibitedCommand: IsReviewProhibitedCommand,
    private readonly isAdminCommand: IsAdminCommand,
  ) {}

  public async config(env: string) {
    if (env === 'local') return this.getLocalGuardConfig()
    if (env === 'dev') return this.getDevGuardConfig()
    if (env === 'prod') return this.getProdGuardConfig()
    return this.getProdGuardConfig()
  }

  private getLocalGuardConfig = () => this.authChain
    .register(this.isPublicCommand)
    .register(this.studentHeaderCommand)
    .register(this.jwtHeaderCommand)
    .register(this.sidHeaderCommand)
    .register(this.sidCookieCommand)
    .register(this.jwtCookieCommand)
    .register(this.syncApiKeyCommand)
    .register(this.isReviewProhibitedCommand)
    .register(this.isAdminCommand)

  private getDevGuardConfig = () => this.authChain
    .register(this.isPublicCommand)
    .register(this.studentHeaderCommand)
    .register(this.jwtHeaderCommand)
    .register(this.sidHeaderCommand)
    .register(this.sidCookieCommand)
    .register(this.jwtCookieCommand)
    .register(this.syncApiKeyCommand)
    .register(this.isReviewProhibitedCommand)
    .register(this.isAdminCommand)

  private getProdGuardConfig = () => this.authChain
    .register(this.jwtHeaderCommand)
    .register(this.jwtCookieCommand)
    .register(this.isPublicCommand)
    .register(this.syncApiKeyCommand)
    .register(this.isReviewProhibitedCommand)
    .register(this.isAdminCommand)
}
