import { ExecutionContext, Injectable, NotFoundException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { AuthCommand, AuthResult } from '@otl/server-nest/modules/auth/auth.command'
import { AuthService } from '@otl/server-nest/modules/auth/auth.service'
import settings from '@otl/server-nest/settings'
import { Request, Response } from 'express'

type OneAppPayload = { uid: string | number }

@Injectable()
export class OneAppHeaderCommand implements AuthCommand {
  private readonly jwtConfig = settings().getJwtConfig()

  constructor(
    private reflector: Reflector,
    private authService: AuthService,
    private jwtService: JwtService, // 형식 유지(미사용)
  ) {}

  public async next(context: ExecutionContext, prevResult: AuthResult): Promise<AuthResult> {
    const request = context.switchToHttp().getRequest<Request>()
    const response = context.switchToHttp().getResponse<Response>()

    const accessToken = this.extractTokenFromHeader(request, 'accessToken')
    const refreshToken = this.extractTokenFromHeader(request, 'refreshToken')

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
    // issuer/알고리즘이 다른 외부(OneApp) 토큰 검증
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

      // 필요 시 우리 서비스 쿠키를 발급하려면 sid 매핑이 있어야 함.
      // user 객체에 sid가 있다면 같은 형식으로 재발급
      const sid: string | undefined = (user as any)?.sid
      if (sid) {
        const { accessToken: newAccessToken, ...accessTokenOptions } = this.authService.getCookieWithAccessToken(sid)
        const { refreshToken: newRefreshToken, ...refreshTokenOptions } = this.authService.getCookieWithRefreshToken(sid)

        response.cookie('accessToken', newAccessToken, accessTokenOptions)
        response.cookie('refreshToken', newRefreshToken, refreshTokenOptions)
      }

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

  private extractTokenFromHeader(request: Request, type: 'accessToken' | 'refreshToken'): string | undefined {
    if (type === 'accessToken') {
      const authHeader = request.headers.authorization
      if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7)
      }
    }
    if (type === 'refreshToken') {
      // 헤더 키 형식 동일 유지
      const refreshHeader = request.headers['X-REFRESH-TOKEN'] as string | undefined
      if (typeof refreshHeader === 'string') {
        return refreshHeader
      }
    }
    return undefined
  }
}
