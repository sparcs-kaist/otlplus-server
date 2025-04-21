import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'

import { AuthCommand, AuthResult } from '../auth.command'
import { AuthService } from '../auth.service'

@Injectable()
export class StudentIdHeaderCommand implements AuthCommand {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  public async next(context: ExecutionContext, prevResult: AuthResult): Promise<AuthResult> {
    const request = context.switchToHttp().getRequest<Request>()
    const studentId = request.headers['x-auth-sid']

    if (typeof studentId === 'string') {
      const user = await this.authService.findByStudentId(Number(studentId))
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
