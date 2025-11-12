import { ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'

import { AuthCommand, AuthResult } from '../auth.command'

@Injectable()
export class IpRangeCommand implements AuthCommand {
  private readonly allowedCidr = '210.117.237.0/24'

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
    const clientIp = this.getClientIp(request)

    // If IP is not in allowed range, block authentication
    if (!this.isIpInRange(clientIp, this.allowedCidr)) {
      console.log(`IP ${clientIp} is outside the allowed range.`)
      return {
        ...prevResult,
        authentication: false,
        authorization: false,
      }
    }
    console.log(`IP ${clientIp} is within the allowed range.`)

    return prevResult
  }
}
