import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from '@otl/server-nest/common/decorators/skip-auth.decorator'
import { AuthCommand, AuthResult } from '@otl/server-nest/modules/auth/auth.command'
import { AuthService } from '@otl/server-nest/modules/auth/auth.service'
import { Request, Response } from 'express'

@Injectable()
export class JwtHeaderCommand implements AuthCommand {
  constructor(private reflector: Reflector, private authService: AuthService) {}

  public async next(context: ExecutionContext, prevResult: AuthResult): Promise<AuthResult> {
    if (prevResult.authentication) return prevResult
    const request = context.switchToHttp().getRequest<Request>()
    const response = context.switchToHttp().getResponse<Response>()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), context.getClass(),
    ])
    // Explicit refresh/logout routes own their token mutation; never rotate twice.
    const user = await this.authService.authenticateTokens(
      this.authService.extractTokenFromHeader(request, 'accessToken'),
      isPublic ? undefined : this.authService.extractTokenFromHeader(request, 'refreshToken'),
      response,
    )
    if (!user) return prevResult
    request.user = user
    return { ...prevResult, authentication: true, authorization: true }
  }
}
