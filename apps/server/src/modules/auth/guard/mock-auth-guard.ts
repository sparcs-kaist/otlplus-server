import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { IS_PUBLIC_KEY } from '@otl/server-nest/common/decorators/skip-auth.decorator'
import settings from '@otl/server-nest/settings'
import * as bcrypt from 'bcrypt'
import { Request } from 'express'

import { AuthService } from '../auth.service'

@Injectable()
export class MockAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
    private jwtService: JwtService,
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
    const extractdAccessToken = this.extractTokenFromCookie(request, 'accessToken')

    try {
      if (!extractdAccessToken) throw new Error('jwt expired')
      const payload = await this.jwtService.verify(extractdAccessToken, {
        secret: settings().getJwtConfig().secret,
        ignoreExpiration: false,
      })
      const user = this.authService.findBySid(payload.sid)
      request.user = user
      return true
    }
    catch (e: any) {
      if (e.message === 'jwt expired') {
        try {
          const refreshToken = this.extractTokenFromCookie(request, 'refreshToken')
          if (!refreshToken) throw new UnauthorizedException()
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
            return this.determineAuth(context, true)
          }
          return this.determineAuth(context, false)
        }
        catch (_e) {
          const result = this.determineAuth(context, false)
          if (result) {
            return result
          }
          throw new UnauthorizedException()
        }
      }
      const result = this.determineAuth(context, false)
      if (result) {
        return result
      }
      throw new UnauthorizedException()
    }
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
