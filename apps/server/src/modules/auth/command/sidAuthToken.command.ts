import { ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'

import { AuthCommand, AuthResult } from '../auth.command'

@Injectable()
export class SidAuthTokenCommand implements AuthCommand {
  public async next(context: ExecutionContext, prevResult: AuthResult): Promise<AuthResult> {
    const request = context.switchToHttp().getRequest<Request>()
    const token = request.headers['x-sid-auth-token']

    if (typeof token !== 'string') {
      console.log('no token')
      return {
        ...prevResult,
        authentication: false,
        authorization: false,
      }
    }

    console.log('token:', token)

    // Verify token against environment variable
    const expectedToken = process.env.SID_AUTH_TOKEN
    if (!expectedToken || token !== expectedToken) {
      console.log('invalid token', expectedToken)
      return {
        ...prevResult,
        authentication: false,
        authorization: false,
      }
    }

    return prevResult
  }
}
