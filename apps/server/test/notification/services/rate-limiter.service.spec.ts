import { Test, TestingModule } from '@nestjs/testing'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { RateLimiterService } from '@otl/server-nest/modules/notification/services/rate-limiter.service'
import { AgreementType } from '@otl/common/enum/agreement'
import { MockCacheManager } from '../mocks/cache-manager.mock'

describe('RateLimiterService', () => {
  let service: RateLimiterService
  let cacheManager: MockCacheManager

  beforeEach(async () => {
    cacheManager = new MockCacheManager()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimiterService,
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
      ],
    }).compile()

    service = module.get<RateLimiterService>(RateLimiterService)
  })

  afterEach(async () => {
    await cacheManager.clear()
  })

  describe('INFO notifications (unlimited)', () => {
    it('should allow unlimited INFO notifications', async () => {
      const results: boolean[] = []

      // Try 10 notifications
      for (let i = 0; i < 10; i++) {
        results.push(await service.checkRateLimit(1, 'test-notification', AgreementType.INFO))
      }

      // All should be allowed
      expect(results.every((r) => r === true)).toBe(true)
    })
  })

  describe('MARKETING notifications (3 per day)', () => {
    it('should allow first notification within rate limit', async () => {
      const result = await service.checkRateLimit(1, 'marketing-notification', AgreementType.MARKETING)

      expect(result).toBe(true)
    })

    it('should allow up to 3 MARKETING notifications per day', async () => {
      const results: boolean[] = []

      for (let i = 0; i < 3; i++) {
        results.push(await service.checkRateLimit(1, 'marketing-notification', AgreementType.MARKETING))
      }

      expect(results).toEqual([true, true, true])
    })

    it('should block 4th MARKETING notification within 24h window', async () => {
      // Send 3 notifications (allowed)
      await service.checkRateLimit(1, 'marketing-notification', AgreementType.MARKETING)
      await service.checkRateLimit(1, 'marketing-notification', AgreementType.MARKETING)
      await service.checkRateLimit(1, 'marketing-notification', AgreementType.MARKETING)

      // 4th should be blocked
      const result = await service.checkRateLimit(1, 'marketing-notification', AgreementType.MARKETING)

      expect(result).toBe(false)
    })

    it('should allow MARKETING notification after 24h window expires', async () => {
      jest.useFakeTimers()
      const now = new Date('2024-01-01T12:00:00Z').getTime()
      jest.setSystemTime(now)

      // Send 3 notifications
      await service.checkRateLimit(1, 'marketing-notification', AgreementType.MARKETING)
      await service.checkRateLimit(1, 'marketing-notification', AgreementType.MARKETING)
      await service.checkRateLimit(1, 'marketing-notification', AgreementType.MARKETING)

      // 4th is blocked
      expect(await service.checkRateLimit(1, 'marketing-notification', AgreementType.MARKETING)).toBe(false)

      // Advance time by 25 hours (past 24h window)
      jest.setSystemTime(now + 25 * 60 * 60 * 1000)

      // Should be allowed now
      expect(await service.checkRateLimit(1, 'marketing-notification', AgreementType.MARKETING)).toBe(true)

      jest.useRealTimers()
    })

    it('should track different users separately', async () => {
      // User 1 reaches limit
      await service.checkRateLimit(1, 'marketing-notification', AgreementType.MARKETING)
      await service.checkRateLimit(1, 'marketing-notification', AgreementType.MARKETING)
      await service.checkRateLimit(1, 'marketing-notification', AgreementType.MARKETING)
      expect(await service.checkRateLimit(1, 'marketing-notification', AgreementType.MARKETING)).toBe(false)

      // User 2 should still be allowed
      expect(await service.checkRateLimit(2, 'marketing-notification', AgreementType.MARKETING)).toBe(true)
    })

    it('should track different notifications separately', async () => {
      // Notification A reaches limit
      await service.checkRateLimit(1, 'notification-a', AgreementType.MARKETING)
      await service.checkRateLimit(1, 'notification-a', AgreementType.MARKETING)
      await service.checkRateLimit(1, 'notification-a', AgreementType.MARKETING)
      expect(await service.checkRateLimit(1, 'notification-a', AgreementType.MARKETING)).toBe(false)

      // Notification B should still be allowed for same user
      expect(await service.checkRateLimit(1, 'notification-b', AgreementType.MARKETING)).toBe(true)
    })
  })

  describe('NIGHT_MARKETING notifications (1 per day)', () => {
    it('should allow 1 NIGHT_MARKETING notification per day', async () => {
      const result = await service.checkRateLimit(1, 'night-notification', AgreementType.NIGHT_MARKETING)

      expect(result).toBe(true)
    })

    it('should block 2nd NIGHT_MARKETING notification within 24h', async () => {
      await service.checkRateLimit(1, 'night-notification', AgreementType.NIGHT_MARKETING)

      const result = await service.checkRateLimit(1, 'night-notification', AgreementType.NIGHT_MARKETING)

      expect(result).toBe(false)
    })
  })

  describe('Cache unavailability', () => {
    it('should return true when cache manager is not available', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [RateLimiterService],
      }).compile()

      const serviceWithoutCache = module.get<RateLimiterService>(RateLimiterService)

      const result = await serviceWithoutCache.checkRateLimit(1, 'test', AgreementType.MARKETING)

      expect(result).toBe(true)
    })

    it('should handle cache errors gracefully (fail-open)', async () => {
      // Mock cache to throw an error
      jest.spyOn(cacheManager, 'get').mockRejectedValue(new Error('Cache error'))

      const result = await service.checkRateLimit(1, 'test', AgreementType.MARKETING)

      expect(result).toBe(true)
    })

    it('should handle cache set errors gracefully', async () => {
      jest.spyOn(cacheManager, 'set').mockRejectedValue(new Error('Cache set error'))

      const result = await service.checkRateLimit(1, 'test', AgreementType.MARKETING)

      // Should still return true (fail-open)
      expect(result).toBe(true)
    })
  })

  describe('Sliding window behavior', () => {
    it('should correctly filter expired timestamps', async () => {
      jest.useFakeTimers()
      const now = new Date('2024-01-01T12:00:00Z').getTime()
      jest.setSystemTime(now)

      // Send 3 notifications at T=0
      await service.checkRateLimit(1, 'test', AgreementType.MARKETING)
      await service.checkRateLimit(1, 'test', AgreementType.MARKETING)
      await service.checkRateLimit(1, 'test', AgreementType.MARKETING)

      // At T=23h, should still be blocked
      jest.setSystemTime(now + 23 * 60 * 60 * 1000)
      expect(await service.checkRateLimit(1, 'test', AgreementType.MARKETING)).toBe(false)

      // At T=25h, oldest timestamp expires, should allow 1 more
      jest.setSystemTime(now + 25 * 60 * 60 * 1000)
      expect(await service.checkRateLimit(1, 'test', AgreementType.MARKETING)).toBe(true)

      jest.useRealTimers()
    })

    it('should maintain correct count as old entries expire', async () => {
      jest.useFakeTimers()
      const now = new Date('2024-01-01T00:00:00Z').getTime()
      jest.setSystemTime(now)

      // Send at T=0h
      await service.checkRateLimit(1, 'test', AgreementType.MARKETING)

      // Send at T=12h
      jest.setSystemTime(now + 12 * 60 * 60 * 1000)
      await service.checkRateLimit(1, 'test', AgreementType.MARKETING)

      // Send at T=23h
      jest.setSystemTime(now + 23 * 60 * 60 * 1000)
      await service.checkRateLimit(1, 'test', AgreementType.MARKETING)

      // At T=24h, first entry (T=0h) expires (exactly 24h old), only 2 remain
      // Sliding window uses strict < comparison, so exactly 24h old entries are excluded
      jest.setSystemTime(now + 24 * 60 * 60 * 1000)
      expect(await service.checkRateLimit(1, 'test', AgreementType.MARKETING)).toBe(true)

      // Send 4th at T=24h (now have 3: T=12h, T=23h, T=24h)
      await service.checkRateLimit(1, 'test', AgreementType.MARKETING)

      // At T=36h, T=12h entry expires, 2 remain (T=23h, T=24h)
      jest.setSystemTime(now + 36 * 60 * 60 * 1000)
      expect(await service.checkRateLimit(1, 'test', AgreementType.MARKETING)).toBe(true)

      jest.useRealTimers()
    })
  })

  describe('Cache key format', () => {
    it('should use correct cache key format', async () => {
      await service.checkRateLimit(123, 'my-notification', AgreementType.MARKETING)

      expect(cacheManager.has('ratelimit:123:my-notification')).toBe(true)
    })
  })
})
