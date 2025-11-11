import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'

import { AuthCommand, AuthResult } from '../auth.command'
import { AuthService } from '../auth.service'

@Injectable()
export class SidHeaderCommand implements AuthCommand {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  private isIpInRange(ip: string, cidr: string): boolean {
    const [range, bits] = cidr.split('/')
    // eslint-disable-next-line no-bitwise
    const mask = ~(2 ** (32 - parseInt(bits)) - 1)

    const ipToInt = (ipAddr: string): number => ipAddr.split('.').reduce((int, oct) => (int << 8) + parseInt(oct), 0) >>> 0 // eslint-disable-line no-bitwise

    // eslint-disable-next-line no-bitwise
    return (ipToInt(ip) & mask) === (ipToInt(range) & mask)
  }

  private getClientIp(request: Request): string {
    // Check for common proxy headers
    const xForwardedFor = request.headers['x-forwarded-for']
    if (xForwardedFor) {
      const ips = typeof xForwardedFor === 'string' ? xForwardedFor.split(',') : xForwardedFor
      return ips[0].trim()
    }

    const xRealIp = request.headers['x-real-ip']
    if (xRealIp && typeof xRealIp === 'string') {
      return xRealIp.trim()
    }

    return request.ip || request.socket.remoteAddress || ''
  }

  public async next(context: ExecutionContext, prevResult: AuthResult): Promise<AuthResult> {
    const request = context.switchToHttp().getRequest<Request>()
    const sidHeader = request.headers['x-auth-sid']

    if (typeof sidHeader !== 'string') {
      return prevResult
    }

    try {
      // Parse JSON from header
      const sidData = JSON.parse(sidHeader)
      const { studentNo, token } = sidData

      if (!studentNo || !token) {
        return prevResult
      }

      // Verify token
      const expectedToken = process.env.SID_AUTH_TOKEN
      if (!expectedToken || token !== expectedToken) {
        return prevResult
      }

      // Verify IP range
      const clientIp = this.getClientIp(request)
      const allowedCidr = '210.117.237.0/24'

      if (!this.isIpInRange(clientIp, allowedCidr)) {
        return prevResult
      }

      // Authenticate user
      const user = await this.authService.findBySid(studentNo)
      if (!user) {
        return prevResult
      }

      request.user = user
      return {
        ...prevResult,
        authentication: true,
        authorization: true,
      }
    }
    catch (_error) {
      // JSON parse error or other errors - return prevResult
      return prevResult
    }
  }
}
