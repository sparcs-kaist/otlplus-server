import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'

import { AuthCommand, AuthResult } from '../auth.command'
import { AuthService } from '../auth.service'

@Injectable()
export class SidHeaderCommand implements AuthCommand {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  public async next(context: ExecutionContext, prevResult: AuthResult): Promise<AuthResult> {
    const request = context.switchToHttp().getRequest<Request>()
    const sid = request.headers['x-auth-sid']

    if (typeof sid === 'string') {
      const user = await this.authService.findBySid(sid)
      if (!user) {
        return prevResult
      }

      request.user = user
      return {
        ...prevResult,
        authentication: true,
        authorization: true,
      }
    }

    return prevResult
  }
}
