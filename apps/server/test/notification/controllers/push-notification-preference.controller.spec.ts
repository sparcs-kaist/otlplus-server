import { Test, TestingModule } from '@nestjs/testing'

import { PushNotificationPreferenceController } from '@otl/server-nest/modules/notification/push-notification-preference.controller'
import {
  PUSH_NOTIFICATION_PREFERENCE_PORT,
  PushNotificationPreferencePort,
} from '@otl/server-nest/modules/notification/domain/push-notification.in.port'
import { NotificationFactory } from '../factories/notification.factory'

describe('PushNotificationPreferenceController', () => {
  let controller: PushNotificationPreferenceController
  let service: jest.Mocked<PushNotificationPreferencePort>

  const mockUser = { id: 1, username: 'testuser' } as any

  beforeEach(async () => {
    // Create mock service
    service = {
      getPreferences: jest.fn(),
      updatePreferences: jest.fn(),
      updateDetailPreference: jest.fn(),
      getHistory: jest.fn(),
      markAsRead: jest.fn(),
    } as any

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PushNotificationPreferenceController],
      providers: [
        {
          provide: PUSH_NOTIFICATION_PREFERENCE_PORT,
          useValue: service,
        },
      ],
    }).compile()

    controller = module.get<PushNotificationPreferenceController>(PushNotificationPreferenceController)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getPreferences', () => {
    it('should get preferences for authenticated user', async () => {
      const mockAgreement = NotificationFactory.createAgreement({ userId: 1 })
      service.getPreferences.mockResolvedValue(mockAgreement)

      const result = await controller.getPreferences(mockUser)

      expect(service.getPreferences).toHaveBeenCalledWith(1)
      expect(result).toBe(mockAgreement)
    })
  })

  describe('updatePreferences', () => {
    it('should update preferences with user ID from token', async () => {
      const dto = {
        info: false,
        marketing: true,
        nightMarketing: false,
      }

      const mockAgreement = NotificationFactory.createAgreement({
        userId: 1,
        ...dto,
      })
      service.updatePreferences.mockResolvedValue(mockAgreement)

      const result = await controller.updatePreferences(mockUser, dto as any)

      expect(service.updatePreferences).toHaveBeenCalledWith(1, dto)
      expect(result).toBe(mockAgreement)
    })
  })

  describe('updateDetailPreference', () => {
    it('should update detail preference for specific notification', async () => {
      const dto = {
        notificationName: 'notification-1',
        active: false,
      }

      const mockAgreement = NotificationFactory.createAgreement({
        userId: 1,
        detail: { 'notification-1': false },
      })
      service.updateDetailPreference.mockResolvedValue(mockAgreement)

      const result = await controller.updateDetailPreference(mockUser, dto as any)

      expect(service.updateDetailPreference).toHaveBeenCalledWith(1, 'notification-1', false)
      expect(result).toBe(mockAgreement)
    })
  })

  describe('getHistory', () => {
    it('should get history with pagination params', async () => {
      const query = {
        cursor: 10,
        limit: 20,
      }

      const mockHistory = [NotificationFactory.createHistory({ userId: 1 })]
      service.getHistory.mockResolvedValue(mockHistory)

      const result = await controller.getHistory(mockUser, query as any)

      expect(service.getHistory).toHaveBeenCalledWith(1, 10, 20)
      expect(result).toBe(mockHistory)
    })

    it('should handle query without cursor and limit', async () => {
      const query = {}

      const mockHistory = [NotificationFactory.createHistory({ userId: 1 })]
      service.getHistory.mockResolvedValue(mockHistory)

      const result = await controller.getHistory(mockUser, query as any)

      expect(service.getHistory).toHaveBeenCalledWith(1, undefined, undefined)
      expect(result).toBe(mockHistory)
    })
  })

  describe('markAsRead', () => {
    it('should mark history as read for authenticated user', async () => {
      service.markAsRead.mockResolvedValue(undefined)

      const result = await controller.markAsRead(mockUser, 5)

      expect(service.markAsRead).toHaveBeenCalledWith(1, 5)
      expect(result).toEqual({ success: true })
    })
  })
})
