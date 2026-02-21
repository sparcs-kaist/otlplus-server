import { Test, TestingModule } from '@nestjs/testing'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { DigestService } from '@otl/server-nest/modules/notification/services/digest.service'
import { MockCacheManager } from '../mocks/cache-manager.mock'

describe('DigestService', () => {
  let service: DigestService
  let cacheManager: MockCacheManager

  beforeEach(async () => {
    cacheManager = new MockCacheManager()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DigestService,
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
      ],
    }).compile()

    service = module.get<DigestService>(DigestService)
  })

  afterEach(async () => {
    await cacheManager.clear()
  })

  describe('addToDigest', () => {
    it('should add event to new digest', async () => {
      await service.addToDigest('test-digest', { message: 'event1' }, 300)

      const stored = await cacheManager.get<string>('digest:test-digest')
      const events = JSON.parse(stored!)

      expect(events).toEqual([{ message: 'event1' }])
    })

    it('should append events to existing digest', async () => {
      await service.addToDigest('test-digest', { message: 'event1' }, 300)
      await service.addToDigest('test-digest', { message: 'event2' }, 300)
      await service.addToDigest('test-digest', { message: 'event3' }, 300)

      const stored = await cacheManager.get<string>('digest:test-digest')
      const events = JSON.parse(stored!)

      expect(events).toEqual([{ message: 'event1' }, { message: 'event2' }, { message: 'event3' }])
    })

    it('should respect window TTL', async () => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-01-01T00:00:00Z'))

      await service.addToDigest('test-digest', { message: 'event1' }, 60) // 60 seconds

      expect(cacheManager.has('digest:test-digest')).toBe(true)

      // Advance time by 61 seconds
      jest.setSystemTime(new Date('2024-01-01T00:01:01Z'))

      // Should be expired (cache returns null for expired/missing keys)
      const stored = await cacheManager.get<string>('digest:test-digest')
      expect(stored).toBeNull()

      jest.useRealTimers()
    })

    it('should handle different event types', async () => {
      await service.addToDigest('test-digest', 'string-event', 300)
      await service.addToDigest('test-digest', 123, 300)
      await service.addToDigest('test-digest', { complex: { nested: 'object' } }, 300)

      const stored = await cacheManager.get<string>('digest:test-digest')
      const events = JSON.parse(stored!)

      expect(events).toEqual(['string-event', 123, { complex: { nested: 'object' } }])
    })

    it('should handle cache unavailability gracefully', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [DigestService],
      }).compile()

      const serviceWithoutCache = module.get<DigestService>(DigestService)

      // Should not throw
      await expect(serviceWithoutCache.addToDigest('test', { event: 1 }, 300)).resolves.toBeUndefined()
    })

    it('should handle cache errors gracefully', async () => {
      jest.spyOn(cacheManager, 'get').mockRejectedValue(new Error('Cache error'))

      // Should not throw
      await expect(service.addToDigest('test', { event: 1 }, 300)).resolves.toBeUndefined()
    })

    it('should handle JSON parse errors', async () => {
      await cacheManager.set('digest:test-digest', 'invalid-json', 300)

      // Should not throw
      await expect(service.addToDigest('test-digest', { event: 1 }, 300)).resolves.toBeUndefined()
    })

    it('should maintain event order', async () => {
      const events = [
        { id: 1, timestamp: Date.now() },
        { id: 2, timestamp: Date.now() + 1000 },
        { id: 3, timestamp: Date.now() + 2000 },
      ]

      for (const event of events) {
        await service.addToDigest('test-digest', event, 300)
      }

      const stored = await cacheManager.get<string>('digest:test-digest')
      const storedEvents = JSON.parse(stored!)

      expect(storedEvents).toEqual(events)
    })

    it('should handle multiple digest keys independently', async () => {
      await service.addToDigest('digest-1', { key: 1 }, 300)
      await service.addToDigest('digest-2', { key: 2 }, 300)
      await service.addToDigest('digest-1', { key: 3 }, 300)

      const digest1 = await cacheManager.get<string>('digest:digest-1')
      const digest2 = await cacheManager.get<string>('digest:digest-2')

      expect(JSON.parse(digest1!)).toEqual([{ key: 1 }, { key: 3 }])
      expect(JSON.parse(digest2!)).toEqual([{ key: 2 }])
    })
  })

  describe('flushDigest', () => {
    it('should return empty array when digest does not exist', async () => {
      const events = await service.flushDigest('non-existent')

      expect(events).toEqual([])
    })

    it('should flush and clear digest after retrieval', async () => {
      await service.addToDigest('test-digest', { message: 'event1' }, 300)
      await service.addToDigest('test-digest', { message: 'event2' }, 300)

      const events = await service.flushDigest('test-digest')

      expect(events).toEqual([{ message: 'event1' }, { message: 'event2' }])

      // Should be cleared
      expect(cacheManager.has('digest:test-digest')).toBe(false)

      // Second flush should return empty
      const events2 = await service.flushDigest('test-digest')
      expect(events2).toEqual([])
    })

    it('should return empty when cache unavailable', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [DigestService],
      }).compile()

      const serviceWithoutCache = module.get<DigestService>(DigestService)

      const events = await serviceWithoutCache.flushDigest('test')

      expect(events).toEqual([])
    })

    it('should handle cache errors gracefully', async () => {
      jest.spyOn(cacheManager, 'get').mockRejectedValue(new Error('Cache error'))

      const events = await service.flushDigest('test-digest')

      expect(events).toEqual([])
    })

    it('should handle JSON parse errors during flush', async () => {
      await cacheManager.set('digest:test-digest', 'invalid-json', 300)

      const events = await service.flushDigest('test-digest')

      expect(events).toEqual([])
    })

    it('should handle delete errors gracefully', async () => {
      await service.addToDigest('test-digest', { event: 1 }, 300)
      jest.spyOn(cacheManager, 'del').mockRejectedValue(new Error('Delete error'))

      // Service catches all errors in flushDigest and returns empty array
      const events = await service.flushDigest('test-digest')

      expect(events).toEqual([])
    })
  })

  describe('Digest workflow', () => {
    it('should accumulate events over time and flush them', async () => {
      // Add events
      await service.addToDigest('workflow-test', { type: 'click', userId: 1 }, 300)
      await service.addToDigest('workflow-test', { type: 'view', userId: 2 }, 300)
      await service.addToDigest('workflow-test', { type: 'click', userId: 3 }, 300)

      // Flush and verify
      const events = await service.flushDigest('workflow-test')
      expect(events).toHaveLength(3)
      expect(events).toEqual([
        { type: 'click', userId: 1 },
        { type: 'view', userId: 2 },
        { type: 'click', userId: 3 },
      ])

      // Verify cleared
      const eventsAfterFlush = await service.flushDigest('workflow-test')
      expect(eventsAfterFlush).toEqual([])
    })
  })
})
