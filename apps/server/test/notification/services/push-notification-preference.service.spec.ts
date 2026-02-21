import { Test, TestingModule } from '@nestjs/testing'

import { PushNotificationPreferenceService } from '@otl/server-nest/modules/notification/push-notification-preference.service'
import { PUSH_NOTIFICATION_REPOSITORY } from '@otl/server-nest/modules/notification/domain/push-notification.repository'
import { MockPushNotificationRepository } from '../mocks/push-notification.repository.mock'
import { NotificationFactory } from '../factories/notification.factory'

describe('PushNotificationPreferenceService', () => {
  let service: PushNotificationPreferenceService
  let repository: MockPushNotificationRepository

  beforeEach(async () => {
    repository = new MockPushNotificationRepository()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushNotificationPreferenceService,
        {
          provide: PUSH_NOTIFICATION_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile()

    service = module.get<PushNotificationPreferenceService>(PushNotificationPreferenceService)
  })

  afterEach(() => {
    repository.reset()
  })

  describe('getPreferences', () => {
    it('should return existing preferences', async () => {
      const agreement = NotificationFactory.createAgreement({
        userId: 1,
        info: true,
        marketing: true,
        nightMarketing: false,
      })
      repository.seedAgreements([agreement])

      const result = await service.getPreferences(1)

      expect(result.userId).toBe(1)
      expect(result.info).toBe(true)
      expect(result.marketing).toBe(true)
      expect(result.nightMarketing).toBe(false)
    })

    it('should create default preferences when not exists', async () => {
      const result = await service.getPreferences(1)

      expect(result.userId).toBe(1)
      expect(result.info).toBe(true)
      expect(result.marketing).toBe(false)
      expect(result.nightMarketing).toBe(false)
      expect(result.detail).toBeNull()

      // Verify it was persisted
      const stored = await repository.getAgreement(1)
      expect(stored).not.toBeNull()
      expect(stored?.info).toBe(true)
    })
  })

  describe('updatePreferences', () => {
    beforeEach(() => {
      const agreement = NotificationFactory.createAgreement({ userId: 1 })
      repository.seedAgreements([agreement])
    })

    it('should update info flag', async () => {
      const result = await service.updatePreferences(1, { info: false })

      expect(result.info).toBe(false)
    })

    it('should update marketing flag', async () => {
      const result = await service.updatePreferences(1, { marketing: true })

      expect(result.marketing).toBe(true)
    })

    it('should update nightMarketing flag', async () => {
      const result = await service.updatePreferences(1, { nightMarketing: true })

      expect(result.nightMarketing).toBe(true)
    })

    it('should update multiple flags at once', async () => {
      const result = await service.updatePreferences(1, {
        info: false,
        marketing: true,
        nightMarketing: true,
      })

      expect(result.info).toBe(false)
      expect(result.marketing).toBe(true)
      expect(result.nightMarketing).toBe(true)
    })
  })

  describe('updateDetailPreference', () => {
    beforeEach(() => {
      const agreement = NotificationFactory.createAgreement({
        userId: 1,
        detail: { 'notification-1': true },
        detailVersion: 1,
      })
      repository.seedAgreements([agreement])
    })

    it('should update detail preference for specific notification', async () => {
      const result = await service.updateDetailPreference(1, 'notification-2', false)

      expect(result.detail).toEqual({
        'notification-1': true,
        'notification-2': false,
      })
    })

    it('should increment detailVersion on detail update', async () => {
      const before = await repository.getAgreement(1)
      expect(before?.detailVersion).toBe(1)

      const result = await service.updateDetailPreference(1, 'notification-2', false)

      expect(result.detailVersion).toBe(2)
    })

    it('should create detail object if it does not exist', async () => {
      const agreement = NotificationFactory.createAgreement({
        userId: 2,
        detail: null,
        detailVersion: 0,
      })
      repository.seedAgreements([agreement])

      const result = await service.updateDetailPreference(2, 'notification-1', true)

      expect(result.detail).toEqual({ 'notification-1': true })
      expect(result.detailVersion).toBe(1)
    })

    it('should overwrite existing detail preference', async () => {
      await service.updateDetailPreference(1, 'notification-1', false)

      const result = await service.updateDetailPreference(1, 'notification-1', true)

      expect(result.detail).toEqual({
        'notification-1': true,
      })
      expect(result.detailVersion).toBe(3) // Incremented twice
    })
  })

  describe('getHistory', () => {
    beforeEach(() => {
      const histories = Array.from({ length: 30 }, (_, i) =>
        NotificationFactory.createHistory({
          id: 30 - i,
          userId: 1,
          title: `Notification ${i + 1}`,
        }),
      )
      repository.seedHistories(histories)
    })

    it('should get user history with default pagination', async () => {
      const result = await service.getHistory(1)

      expect(result).toHaveLength(20) // Default limit
      expect(result[0].id).toBe(30) // Latest first
      expect(result[19].id).toBe(11)
    })

    it('should respect cursor for pagination', async () => {
      const result = await service.getHistory(1, 25)

      expect(result).toHaveLength(20)
      expect(result[0].id).toBe(24) // Items < cursor
      expect(result[19].id).toBe(5)
    })

    it('should respect limit parameter', async () => {
      const result = await service.getHistory(1, undefined, 5)

      expect(result).toHaveLength(5)
      expect(result[0].id).toBe(30)
      expect(result[4].id).toBe(26)
    })

    it('should return empty array for user with no history', async () => {
      const result = await service.getHistory(999)

      expect(result).toEqual([])
    })
  })

  describe('markAsRead', () => {
    beforeEach(() => {
      const history = NotificationFactory.createHistory({
        id: 1,
        userId: 1,
        readAt: null,
      })
      repository.seedHistories([history])
    })

    it('should mark history as read', async () => {
      await service.markAsRead(1, 1)

      const history = repository.getHistories()[0]
      expect(history.readAt).not.toBeNull()
    })

    it('should only mark history for the correct user', async () => {
      // Add history for another user
      const history2 = NotificationFactory.createHistory({
        id: 2,
        userId: 2,
        readAt: null,
      })
      repository.seedHistories([history2])

      await service.markAsRead(1, 2) // Try to mark user 2's history as user 1

      const history = repository.getHistories().find((h) => h.id === 2)
      expect(history?.readAt).toBeNull() // Should not be marked
    })
  })
})
