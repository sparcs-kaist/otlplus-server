import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { IS_ADMIN_KEY } from '@otl/server-nest/common/decorators/admin.decorator'
import { AuthCommand, AuthResult } from '@otl/server-nest/modules/auth/auth.command'
import { LecturesService } from '@otl/server-nest/modules/lectures/lectures.service'
import { Request } from 'express'

import { PrismaService } from '@otl/prisma-client/prisma.service'

@Injectable()
export class IsAdminCommand implements AuthCommand {
  constructor(
    private reflector: Reflector,
    private lectureService: LecturesService,
    private prismaService: PrismaService,
  ) {}

  public async next(context: ExecutionContext, prevResult: AuthResult): Promise<AuthResult> {
    const isAdmin = this.reflector.getAllAndOverride<boolean>(IS_ADMIN_KEY, [context.getHandler()])

    const request = context.switchToHttp().getRequest<Request>()
    if (isAdmin) {
      const adminKey = request.headers['x-auth-admin']
      if (typeof adminKey === 'string') {
        const key = process.env.ADMIN_KEY
        if (adminKey === key) {
          return {
            ...prevResult,
            authentication: true,
            authorization: true,
          }
        }
        return {
          ...prevResult,
          authorization: false,
        }
      }
    }

    return Promise.resolve(prevResult)
  }
}
