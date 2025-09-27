import { ExecutionContext, Injectable, NotFoundException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { AuthCommand, AuthResult } from '@otl/server-nest/modules/auth/auth.command'
import { AuthService } from '@otl/server-nest/modules/auth/auth.service'
import settings from '@otl/server-nest/settings'
import { Request, Response } from 'express'

type TokenPayload = { sid?: string, uid?: string | number, [k: string]: any }

@Injectable()
export class JwtCookieCommand implements AuthCommand {
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
      const payload = await this.verifyTokenFlexible(accessToken)
      const user = await this.getUserFromPayload(payload)

      if (user) {
        request.user = user
        return this.setAuthenticated(prevResult)
      }
      return prevResult
    }
    catch (e: any) {
      if (e.message === 'jwt expired' && refreshToken) {
        return this.handleRefreshToken(refreshToken, request, response, prevResult)
      }
      return prevResult
    }
  }

  // ✅ 헤더 버전과 동일: HS 우선, 실패 시 외부 토큰 검증
  private async verifyTokenFlexible(token: string): Promise<TokenPayload> {
    try {
      return await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: this.jwtConfig.secret,
        ignoreExpiration: false,
      })
    }
    catch {
      return await this.authService.verifyOneAppJwt<TokenPayload>(token, { allowExpired: false })
    }
  }

  private async getUserFromPayload(payload: TokenPayload) {
    if (payload?.sid) {
      return this.authService.findBySid(payload.sid)
    }
    if (payload?.uid != null) {
      // 숫자/문자 모두 허용
      return this.authService.findByUid(String(payload.uid))
    }
    throw new NotFoundException('Neither sid nor uid found in JWT payload')
  }

  private async handleRefreshToken(
    refreshToken: string,
    request: Request,
    response: Response,
    result: AuthResult,
  ): Promise<AuthResult> {
    try {
      const payload = await this.verifyTokenFlexible(refreshToken)
      const user = await this.getUserFromPayload(payload)

      // if (user.refresh_token && (await bcrypt.compare(refreshToken, user.refresh_token))) {
      //   const { accessToken: newAccessToken, ...accessTokenOptions } = this.authService.getCookieWithAccessToken(
      //     payload.sid,
      //   )
      //
      //   if (!response) {
      //     throw new InternalServerErrorException('Response object not found in request context')
      //   }
      //
      //   response.cookie('accessToken', newAccessToken, accessTokenOptions)
      //   request.user = user
      //   return this.setAuthenticated(result)
      // }
      const subjectSid = payload.sid ?? (await this.authService.findSidByUid(String(payload.uid))) ?? user?.sid // user 객체에 sid가 있으면 활용

      if (!subjectSid) {
        // uid만 있는 사용자인데 아직 sid 매핑이 없다면, 쿠키 재발급 없이 통과(또는 회원가입 흐름으로 유도)
        return result
      }

      const { accessToken: newAccessToken, ...accessTokenOptions } = this.authService.getCookieWithAccessToken(subjectSid)
      const { refreshToken: newRefreshToken, ...refreshTokenOptions } = this.authService.getCookieWithRefreshToken(subjectSid)
      response.cookie('accessToken', newAccessToken, accessTokenOptions)
      response.cookie('refreshToken', newRefreshToken, refreshTokenOptions)
      if (user) {
        request.user = user
        return this.setAuthenticated(result)
      }
      return result
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
