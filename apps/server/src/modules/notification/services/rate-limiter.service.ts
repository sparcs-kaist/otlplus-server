import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Optional } from '@nestjs/common'

import { AgreementType } from '@otl/common/enum/agreement'
import logger from '@otl/common/logger/logger'

const DEFAULT_LIMITS: Record<string, number> = {
  [AgreementType.INFO]: 0, // 0 = unlimited
  [AgreementType.MARKETING]: 3,
  [AgreementType.NIGHT_MARKETING]: 1,
}

@Injectable()
export class RateLimiterService {
  constructor(@Optional() @Inject(CACHE_MANAGER) private readonly cacheManager?: Cache) {}

  async checkRateLimit(userId: number, notificationName: string, type: string): Promise<boolean> {
    const limit = DEFAULT_LIMITS[type] ?? 0
    if (limit === 0) return true
    if (!this.cacheManager) return true

    const key = `ratelimit:${userId}:${notificationName}`
    const now = Date.now()
    const windowMs = 24 * 60 * 60 * 1000 // 1 day

    try {
      const raw = await this.cacheManager.get<string>(key)
      const timestamps: number[] = raw ? JSON.parse(raw) : []

      // Filter to only keep timestamps within the window
      const recent = timestamps.filter((ts) => now - ts < windowMs)

      if (recent.length >= limit) {
        logger.info(`[RateLimiter] Rate limit exceeded for user ${userId}, notification ${notificationName}`)
        return false
      }

      recent.push(now)
      await this.cacheManager.set(key, JSON.stringify(recent), windowMs)
      return true
    }
    catch {
      // On cache failure, allow the notification through
      return true
    }
  }
}
