import {
  CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, OnModuleDestroy, ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectRedis } from '@nestjs-modules/ioredis'
import { session_userprofile } from '@prisma/client'
import { Request, Response } from 'express'
import Redis from 'ioredis'

// Both counters and their expiry are atomic and shared across server instances.
const CONSUME_ATTEMPT = `
local retry = 0
for i = 1, 2 do
  if tonumber(redis.call('GET', KEYS[i]) or '0') >= tonumber(ARGV[i * 2 - 1]) then
    retry = math.max(retry, redis.call('TTL', KEYS[i]), 1)
  end
end
if retry > 0 then return retry end
for i = 1, 2 do
  if redis.call('INCR', KEYS[i]) == 1 then
    redis.call('EXPIRE', KEYS[i], ARGV[i * 2])
  end
end
return 0
`

@Injectable()
export class FriendCodeRateLimitGuard implements CanActivate, OnModuleDestroy {
  constructor(@InjectRedis('friends') private readonly redis: Redis) {}

  onModuleDestroy() {
    this.redis.disconnect()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp()
    const request = http.getRequest<Request & { user?: session_userprofile }>()
    if (!request.user) throw new UnauthorizedException()
    const prefix = `friends:add:{${request.user.id}}`
    let retryAfter: number
    try {
      retryAfter = Number(await this.redis.eval(CONSUME_ATTEMPT, 2, `${prefix}:minute`, `${prefix}:day`, 10, 60, 100, 86400))
      if (!Number.isFinite(retryAfter)) throw new Error('Invalid rate limit result')
    }
    catch {
      // Do not allow guessing codes when the shared limiter is unavailable.
      throw new ServiceUnavailableException('Friend code requests are temporarily unavailable')
    }
    if (retryAfter > 0) {
      http.getResponse<Response>().setHeader('Retry-After', retryAfter)
      throw new HttpException('Too many friend code requests', HttpStatus.TOO_MANY_REQUESTS)
    }
    return true
  }
}
