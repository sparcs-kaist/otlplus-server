import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'

import { AuthCommand, AuthResult } from '../auth.command'
import { AuthService } from '../auth.service'

@Injectable()
export class SidCookieCommand implements AuthCommand {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  public async next(context: ExecutionContext, prevResult: AuthResult): Promise<AuthResult> {
    const request = context.switchToHttp().getRequest<Request>()
    const sid = request.cookies['AUTH-SID']
    if (sid) {
      const user = await this.authService.findBySid(sid)
      if (!user) {
        return Promise.resolve(prevResult)
      }
      request.user = user
      return Promise.resolve({
        ...prevResult,
        authentication: true,
        authorization: true,
      })
    }
    return Promise.resolve(prevResult)
  }
}
