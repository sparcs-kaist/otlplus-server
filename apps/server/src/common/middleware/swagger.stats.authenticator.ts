import { JwtService } from '@nestjs/jwt'
import { AuthService } from '@otl/server-nest/modules/auth/auth.service'
import cookie from 'cookie'
import { IncomingMessage } from 'http'

export function createSwaggerStatsAuthenticator(authService: AuthService, _jwtService: JwtService) {
  return async function onAuthenticate(req: IncomingMessage, _username: string, _password: string): Promise<boolean> {
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {}
    try {
      const payload = authService.verifyAccessToken(cookies.accessToken)
      return !!(await authService.findBySid(payload.sid))
    }
    catch {
      // This callback cannot return rotated cookies; refresh through a normal API request.
      return false
    }
  }
}
