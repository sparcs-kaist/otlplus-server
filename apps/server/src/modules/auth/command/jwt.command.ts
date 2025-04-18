import {
  ExecutionContext, Injectable, InternalServerErrorException, NotFoundException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { AuthCommand, AuthResult } from '@otl/server-nest/modules/auth/auth.command'
import { AuthService } from '@otl/server-nest/modules/auth/auth.service'
import settings from '@otl/server-nest/settings'
import * as bcrypt from 'bcrypt'
import { Request } from 'express'

@Injectable()
export class JwtCommand implements AuthCommand {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  public async next(context: ExecutionContext, prevResult: AuthResult): Promise<AuthResult> {
    const request = context.switchToHttp().getRequest<Request>()
    const extractedAccessToken = this.extractTokenFromCookie(request, 'accessToken')

    try {
      if (!extractedAccessToken) throw new Error('jwt expired')
      const payload = await this.jwtService.verify(extractedAccessToken, {
        secret: settings().getJwtConfig().secret,
        ignoreExpiration: false,
      })
      const user = await this.authService.findBySid(payload.sid)

      if (user == null) {
        throw new NotFoundException('user is not found')
      }
      request.user = user
      return {
        ...prevResult,
        authentication: true,
        authorization: true,
      }
    }
    catch (e: any) {
      if (e.message === 'jwt expired') {
        try {
          const refreshToken = this.extractTokenFromCookie(request, 'refreshToken')
          if (!refreshToken) return prevResult
          const payload = await this.jwtService.verify(refreshToken, {
            secret: settings().getJwtConfig().secret,
            ignoreExpiration: false,
          })
          const user = await this.authService.findBySid(payload.sid)
          if (!user) {
            throw new NotFoundException('user is not found')
          }
          if (user.refresh_token && (await bcrypt.compare(refreshToken, user.refresh_token))) {
            const { accessToken, ...accessTokenOptions } = this.authService.getCookieWithAccessToken(payload.sid)

            if (!request.res) {
              throw new InternalServerErrorException('res property is not found in request')
            }
            request.res.cookie('accessToken', accessToken, accessTokenOptions)
            request.user = user
            return {
              ...prevResult,
              authentication: true,
              authorization: true,
            }
          }
        }
        catch (_e: any) {
          // console.error(e);
          return prevResult
        }
      }
      return prevResult
    }
  }

  private extractTokenFromCookie(request: Request, type: 'accessToken' | 'refreshToken'): string | undefined {
    const cookie = request.cookies[type]
    if (cookie) {
      return cookie
    }
    return undefined
  }
}
