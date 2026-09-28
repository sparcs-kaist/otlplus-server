import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from '@otl/server-nest/common/decorators/skip-auth.decorator'
import { Request } from 'express'

import { AuthService } from '../auth.service'

@Injectable()
export class MockAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>()
    const sid = request.cookies['auth-cookie']
    if (sid) {
      const user = await this.authService.findBySid(sid)
      if (!user) {
        throw new NotFoundException('user is not found')
      }

      request.user = user
      return this.determineAuth(context, true)
    }
    const user = await this.authService.authenticateTokens(
      this.extractTokenFromCookie(request, 'accessToken'),
      this.determineAuth(context, false) ? undefined : this.extractTokenFromCookie(request, 'refreshToken'),
      context.switchToHttp().getResponse(),
    )
    if (user) request.user = user
    if (!this.determineAuth(context, !!user)) throw new UnauthorizedException()
    return true
  }

  private determineAuth(context: ExecutionContext, result: boolean): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }
    return result
  }

  private extractTokenFromCookie(request: Request, type: 'accessToken' | 'refreshToken'): string | undefined {
    const cookie = request.cookies[type]
    if (cookie) {
      return cookie
    }
    return undefined
  }
}
