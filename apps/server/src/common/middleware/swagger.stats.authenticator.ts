import { JwtService } from '@nestjs/jwt'
import { AuthService } from '@otl/server-nest/modules/auth/auth.service'
import settings from '@otl/server-nest/settings'
import * as bcrypt from 'bcrypt'
import cookie from 'cookie'
import { IncomingMessage } from 'http'

const jwtConfig = settings().getJwtConfig()

export function createSwaggerStatsAuthenticator(authService: AuthService, jwtService: JwtService) {
  function extractTokenFromCookie(request: IncomingMessage, type: 'accessToken' | 'refreshToken'): string | undefined {
    const cookies = request.headers.cookie ? cookie.parse(request.headers.cookie) : {}
    return cookies[type]
  }

  function verifyToken(token: string): Promise<{ sid: string }> {
    return jwtService.verifyAsync(token, {
      secret: jwtConfig.secret,
      ignoreExpiration: false,
    })
  }
  async function handleRefreshToken(refreshToken: string): Promise<boolean> {
    try {
      const payload = await verifyToken(refreshToken)
      const user = await authService.findBySid(payload.sid)

      if (user?.refresh_token && (await bcrypt.compare(refreshToken, user.refresh_token))) {
        return true
      }
    }
    catch {
      return false
    }
    return false
  }

  return async function onAuthenticate(req: IncomingMessage, _username: string, _password: string): Promise<boolean> {
    const accessToken = extractTokenFromCookie(req, 'accessToken')
    const refreshToken = extractTokenFromCookie(req, 'refreshToken')
    try {
      if (!accessToken) throw new Error('jwt expired')
      const payload = await verifyToken(accessToken)
      const user = await authService.findBySid(payload.sid)

      if (!user) return false
      return true
    }
    catch (e: any) {
      if (e.message === 'jwt expired' && refreshToken) {
        return handleRefreshToken(refreshToken)
      }
      return false
    }
  }
}
