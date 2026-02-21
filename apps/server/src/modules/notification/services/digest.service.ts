import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Optional } from '@nestjs/common'

import logger from '@otl/common/logger/logger'

@Injectable()
export class DigestService {
  constructor(@Optional() @Inject(CACHE_MANAGER) private readonly cacheManager?: Cache) {}

  async addToDigest(digestKey: string, event: unknown, windowSec: number): Promise<void> {
    if (!this.cacheManager) return

    const key = `digest:${digestKey}`
    const windowMs = windowSec * 1000

    try {
      const raw = await this.cacheManager.get<string>(key)
      const events: unknown[] = raw ? JSON.parse(raw) : []
      events.push(event)
      await this.cacheManager.set(key, JSON.stringify(events), windowMs)
    }
    catch (err) {
      logger.error(`[DigestService] Failed to add to digest: ${digestKey}`, err)
    }
  }

  async flushDigest(digestKey: string): Promise<unknown[]> {
    if (!this.cacheManager) return []

    const key = `digest:${digestKey}`

    try {
      const raw = await this.cacheManager.get<string>(key)
      if (!raw) return []

      const events: unknown[] = JSON.parse(raw)
      await this.cacheManager.del(key)
      return events
    }
    catch (err) {
      logger.error(`[DigestService] Failed to flush digest: ${digestKey}`, err)
      return []
    }
  }
}
