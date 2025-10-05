import { ExecutionContext, Injectable, NotFoundException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { AuthCommand, AuthResult } from '@otl/server-nest/modules/auth/auth.command'
import { AuthService } from '@otl/server-nest/modules/auth/auth.service'
import settings from '@otl/server-nest/settings'
import { Request, Response } from 'express'

@Injectable()
export class JwtHeaderCommand implements AuthCommand {
  private readonly jwtConfig = settings().getJwtConfig()

  constructor(
    private reflector: Reflector,
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  public async next(context: ExecutionContext, prevResult: AuthResult): Promise<AuthResult> {
    const request = context.switchToHttp().getRequest<Request>()
    const response = context.switchToHttp().getResponse<Response>()

    const accessToken = this.extractTokenFromHeader(request, 'accessToken')
    const refreshToken = this.extractTokenFromHeader(request, 'refreshToken')

    try {
      if (!accessToken) throw new Error('jwt expired')
      const payload = await this.verifyToken(accessToken)
      const user = await this.getUserFromPayload(payload.sid)

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

  private async verifyToken(token: string): Promise<{ sid: string }> {
    return this.jwtService.verifyAsync(token, {
      secret: this.jwtConfig.secret,
      ignoreExpiration: false,
    })
  }

  private async getUserFromPayload(sid: string) {
    const user = await this.authService.findBySid(sid)
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
      const user = await this.getUserFromPayload(payload.sid)

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
      const { accessToken: newAccessToken, ...accessTokenOptions } = this.authService.getCookieWithAccessToken(
        payload.sid,
      )
      const { refreshToken: newRefreshToken, ...refreshTokenOptions } = this.authService.getCookieWithRefreshToken(
        payload.sid,
      )
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

  private extractTokenFromHeader(request: Request, type: 'accessToken' | 'refreshToken'): string | undefined {
    if (type === 'accessToken') {
      const authHeader = request.headers.authorization
      if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7)
      }
    }
    if (type === 'refreshToken') {
      const refreshHeader = request.headers['X-REFRESH-TOKEN']
      if (typeof refreshHeader === 'string') {
        return refreshHeader
      }
    }
    return undefined
  }
}
