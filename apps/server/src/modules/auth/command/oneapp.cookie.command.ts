import { ExecutionContext, Injectable, NotFoundException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { AuthCommand, AuthResult } from '@otl/server-nest/modules/auth/auth.command'
import { AuthService } from '@otl/server-nest/modules/auth/auth.service'
import settings from '@otl/server-nest/settings'
import { Request, Response } from 'express'

type OneAppPayload = { uid: string | number }

@Injectable()
export class OneAppCookieCommand implements AuthCommand {
  private readonly jwtConfig = settings().getJwtConfig()

  constructor(
    private reflector: Reflector,
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  public async next(context: ExecutionContext, prevResult: AuthResult): Promise<AuthResult> {
    const request = context.switchToHttp().getRequest<Request>()
    const response = context.switchToHttp().getResponse<Response>()

    const accessToken = this.extractTokenFromCookie(request, 'accessToken')
    const refreshToken = this.extractTokenFromCookie(request, 'refreshToken')

    try {
      if (!accessToken) throw new Error('jwt expired')
      const payload = await this.verifyToken(accessToken) // OneApp 토큰 검증
      const user = await this.getUserFromPayload(payload.uid)

      request.user = user
      return this.setAuthenticated(prevResult)
    }
    catch (e: any) {
      if (e.message === 'jwt expired' && refreshToken) {
        return this.handleRefreshToken(refreshToken, request, response, prevResult)
      }
      return prevResult
    }
  }

  private async verifyToken(token: string): Promise<OneAppPayload> {
    return this.authService.verifyOneAppJwt<OneAppPayload>(token, { allowExpired: false })
  }

  private async getUserFromPayload(uid: string | number) {
    const user = await this.authService.findByUid(String(uid))
    if (!user) throw new NotFoundException('user is not found')
    return user
  }

  private async handleRefreshToken(
    refreshToken: string,
    request: Request,
    response: Response,
    result: AuthResult,
  ): Promise<AuthResult> {
    try {
      const payload = await this.verifyToken(refreshToken)
      const user = await this.getUserFromPayload(payload.uid)

      // 우리 서비스 쿠키 재발급에는 sid가 필요 → user.sid 또는 매핑에서 조회
      const sid = (user as any)?.sid ?? (await this.authService.findSidByUid(String(payload.uid)))

      if (!sid) return result

      const { accessToken: newAccessToken, ...accessTokenOptions } = this.authService.getCookieWithAccessToken(sid)
      const { refreshToken: newRefreshToken, ...refreshTokenOptions } = this.authService.getCookieWithRefreshToken(sid)

      response.cookie('accessToken', newAccessToken, accessTokenOptions)
      response.cookie('refreshToken', newRefreshToken, refreshTokenOptions)
      request.user = user
      return this.setAuthenticated(result)
    }
    catch {
      return result
    }
  }

  private setAuthenticated(result: AuthResult): AuthResult {
    return {
      ...result,
      authentication: true,
      authorization: true,
    }
  }

  private extractTokenFromCookie(request: Request, type: 'accessToken' | 'refreshToken'): string | undefined {
    return request.cookies?.[type]
  }
}
