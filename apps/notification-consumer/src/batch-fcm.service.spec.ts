import { Test, TestingModule } from '@nestjs/testing'
import { BatchFcmService } from './batch-fcm.service'
import { CircuitBreakerService } from './circuit-breaker.service'
import { DeviceCleanupService } from './device-cleanup.service'
import {
  ConsumerPushNotificationHistoryRepository,
  PUSH_NOTIFICATION_HISTORY_REPOSITORY,
} from './out/push-notification-history.repository'
import { BatchNotificationMessage } from '@otl/server-nest/modules/notification/domain/push-notification.message'
import { NotificationHistoryStatus } from '@otl/server-nest/modules/notification/domain/push-notification.enums'

// Mock Firebase Admin
const mockSendEach = jest.fn()
jest.mock('firebase-admin/messaging', () => ({
  getMessaging: jest.fn(() => ({
    sendEach: mockSendEach,
  })),
}))

describe('BatchFcmService', () => {
  let service: BatchFcmService
  let historyRepo: jest.Mocked<ConsumerPushNotificationHistoryRepository>
  let circuitBreaker: jest.Mocked<CircuitBreakerService>
  let deviceCleanup: jest.Mocked<DeviceCleanupService>

  const createMockMessage = (recipientCount: number = 1): BatchNotificationMessage => ({
    batchId: 'batch-123',
    notificationId: 1,
    type: 'INFO' as any,
    priority: 'NORMAL' as any,
    title: 'Test Title',
    body: 'Test Body',
    data: {},
    recipients: Array.from({ length: recipientCount }, (_, i) => ({
      userId: i + 1,
      fcmToken: `token-${i + 1}`,
      historyId: i + 1,
      deviceId: i + 1,
    })),
  })

  beforeEach(async () => {
    const mockHistoryRepo = {
      updateStatus: jest.fn(),
      updateBatchCounts: jest.fn(),
    }

    const mockCircuitBreaker = {
      isOpen: jest.fn().mockReturnValue(false),
      record: jest.fn(),
    }

    const mockDeviceCleanup = {
      deactivateTokens: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchFcmService,
        {
          provide: PUSH_NOTIFICATION_HISTORY_REPOSITORY,
          useValue: mockHistoryRepo,
        },
        {
          provide: CircuitBreakerService,
          useValue: mockCircuitBreaker,
        },
        {
          provide: DeviceCleanupService,
          useValue: mockDeviceCleanup,
        },
      ],
    }).compile()

    service = module.get<BatchFcmService>(BatchFcmService)
    historyRepo = module.get(PUSH_NOTIFICATION_HISTORY_REPOSITORY)
    circuitBreaker = module.get(CircuitBreakerService)
    deviceCleanup = module.get(DeviceCleanupService)

    mockSendEach.mockClear()
  })

  describe('processBatch - Success Cases', () => {
    it('should send FCM messages and update history to SENT', async () => {
      const message = createMockMessage(1)
      mockSendEach.mockResolvedValue({
        responses: [{ success: true, messageId: 'fcm-message-id-1' }],
        successCount: 1,
        failureCount: 0,
      })

      await service.processBatch(message)

      expect(mockSendEach).toHaveBeenCalledWith([
        {
          token: 'token-1',
          notification: { title: 'Test Title', body: 'Test Body' },
          data: {
            requestId: 'batch-123',
            notificationName: '1',
          },
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              channelId: 'default',
            },
          },
          apns: {
            headers: { 'apns-priority': '10' },
            payload: { aps: { sound: 'default' } },
          },
        },
      ])

      expect(historyRepo.updateStatus).toHaveBeenCalledWith(
        1,
        NotificationHistoryStatus.SENT,
        expect.objectContaining({
          fcmMessageId: 'fcm-message-id-1',
          sentAt: expect.any(Date),
        }),
      )

      expect(historyRepo.updateBatchCounts).toHaveBeenCalledWith('batch-123', 1, 0)
      expect(circuitBreaker.record).toHaveBeenCalledWith(1, 0)
    })

    it('should construct proper FCM messages with Android config', async () => {
      const message = createMockMessage(1)

      mockSendEach.mockResolvedValue({
        responses: [{ success: true, messageId: 'msg-1' }],
        successCount: 1,
        failureCount: 0,
      })

      await service.processBatch(message)

      const sentMessage = mockSendEach.mock.calls[0][0][0]
      expect(sentMessage.android).toEqual({
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default',
        },
      })
    })

    it('should construct proper FCM messages with APNS config', async () => {
      const message = createMockMessage(1)

      mockSendEach.mockResolvedValue({
        responses: [{ success: true, messageId: 'msg-1' }],
        successCount: 1,
        failureCount: 0,
      })

      await service.processBatch(message)

      const sentMessage = mockSendEach.mock.calls[0][0][0]
      expect(sentMessage.apns).toEqual({
        headers: { 'apns-priority': '10' },
        payload: { aps: { sound: 'default' } },
      })
    })

    it('should include data payload with batchId and notificationId', async () => {
      const message = createMockMessage(1)
      mockSendEach.mockResolvedValue({
        responses: [{ success: true, messageId: 'msg-1' }],
        successCount: 1,
        failureCount: 0,
      })

      await service.processBatch(message)

      const sentMessage = mockSendEach.mock.calls[0][0][0]
      expect(sentMessage.data).toEqual({
        requestId: 'batch-123',
        notificationName: '1',
      })
    })

    it('should handle multiple successful sends', async () => {
      const message = createMockMessage(3)
      mockSendEach.mockResolvedValue({
        responses: [
          { success: true, messageId: 'msg-1' },
          { success: true, messageId: 'msg-2' },
          { success: true, messageId: 'msg-3' },
        ],
        successCount: 3,
        failureCount: 0,
      })

      await service.processBatch(message)

      expect(historyRepo.updateStatus).toHaveBeenCalledTimes(3)
      expect(historyRepo.updateBatchCounts).toHaveBeenCalledWith('batch-123', 3, 0)
      expect(circuitBreaker.record).toHaveBeenCalledWith(3, 0)
    })
  })

  describe('processBatch - Failure Cases', () => {
    it('should handle invalid-registration-token errors', async () => {
      const message = createMockMessage(1)
      mockSendEach.mockResolvedValue({
        responses: [
          {
            success: false,
            error: {
              code: 'messaging/invalid-registration-token',
              message: 'Invalid token',
            },
          },
        ],
        successCount: 0,
        failureCount: 1,
      })

      await service.processBatch(message)

      expect(historyRepo.updateStatus).toHaveBeenCalledWith(1, NotificationHistoryStatus.FAILED, {
        errorCode: 'messaging/invalid-registration-token',
        errorMessage: 'Invalid token',
      })

      expect(deviceCleanup.deactivateTokens).toHaveBeenCalledWith(['token-1'])
      expect(circuitBreaker.record).toHaveBeenCalledWith(0, 1)
    })

    it('should handle not-registered errors', async () => {
      const message = createMockMessage(1)
      mockSendEach.mockResolvedValue({
        responses: [
          {
            success: false,
            error: {
              code: 'messaging/registration-token-not-registered',
              message: 'Token not registered',
            },
          },
        ],
        successCount: 0,
        failureCount: 1,
      })

      await service.processBatch(message)

      expect(deviceCleanup.deactivateTokens).toHaveBeenCalledWith(['token-1'])
    })

    it('should deactivate multiple invalid tokens', async () => {
      const message = createMockMessage(3)
      mockSendEach.mockResolvedValue({
        responses: [
          {
            success: false,
            error: { code: 'messaging/invalid-registration-token', message: 'Invalid' },
          },
          {
            success: false,
            error: { code: 'messaging/invalid-registration-token', message: 'Invalid' },
          },
          {
            success: false,
            error: { code: 'messaging/invalid-registration-token', message: 'Invalid' },
          },
        ],
        successCount: 0,
        failureCount: 3,
      })

      await service.processBatch(message)

      expect(deviceCleanup.deactivateTokens).toHaveBeenCalledWith(['token-1', 'token-2', 'token-3'])
    })

    it('should handle mixed success/failure results', async () => {
      const message = createMockMessage(3)
      mockSendEach.mockResolvedValue({
        responses: [
          { success: true, messageId: 'msg-1' },
          {
            success: false,
            error: { code: 'messaging/invalid-registration-token', message: 'Invalid' },
          },
          { success: true, messageId: 'msg-3' },
        ],
        successCount: 2,
        failureCount: 1,
      })

      await service.processBatch(message)

      expect(historyRepo.updateStatus).toHaveBeenCalledTimes(3)
      expect(historyRepo.updateStatus).toHaveBeenNthCalledWith(
        1,
        1,
        NotificationHistoryStatus.SENT,
        expect.objectContaining({ fcmMessageId: 'msg-1' }),
      )
      expect(historyRepo.updateStatus).toHaveBeenNthCalledWith(2, 2, NotificationHistoryStatus.FAILED, {
        errorCode: 'messaging/invalid-registration-token',
        errorMessage: 'Invalid',
      })
      expect(historyRepo.updateStatus).toHaveBeenNthCalledWith(
        3,
        3,
        NotificationHistoryStatus.SENT,
        expect.objectContaining({ fcmMessageId: 'msg-3' }),
      )

      expect(deviceCleanup.deactivateTokens).toHaveBeenCalledWith(['token-2'])
      expect(historyRepo.updateBatchCounts).toHaveBeenCalledWith('batch-123', 2, 1)
      expect(circuitBreaker.record).toHaveBeenCalledWith(2, 1)
    })

    it('should update history with error details', async () => {
      const message = createMockMessage(1)
      mockSendEach.mockResolvedValue({
        responses: [
          {
            success: false,
            error: {
              code: 'messaging/server-unavailable',
              message: 'Service temporarily unavailable',
            },
          },
        ],
        successCount: 0,
        failureCount: 1,
      })

      await service.processBatch(message)

      expect(historyRepo.updateStatus).toHaveBeenCalledWith(1, NotificationHistoryStatus.FAILED, {
        errorCode: 'messaging/server-unavailable',
        errorMessage: 'Service temporarily unavailable',
      })
    })

    it('should not deactivate tokens for non-token-related errors', async () => {
      const message = createMockMessage(1)
      mockSendEach.mockResolvedValue({
        responses: [
          {
            success: false,
            error: {
              code: 'messaging/server-unavailable',
              message: 'Service unavailable',
            },
          },
        ],
        successCount: 0,
        failureCount: 1,
      })

      await service.processBatch(message)

      expect(deviceCleanup.deactivateTokens).not.toHaveBeenCalled()
    })
  })

  describe('Circuit Breaker Integration', () => {
    it('should throw error when circuit breaker is OPEN', async () => {
      circuitBreaker.isOpen.mockReturnValue(true)
      const message = createMockMessage(1)

      await expect(service.processBatch(message)).rejects.toThrow('FCM circuit breaker is open')

      expect(mockSendEach).not.toHaveBeenCalled()
    })

    it('should not call FCM when circuit breaker is OPEN', async () => {
      circuitBreaker.isOpen.mockReturnValue(true)
      const message = createMockMessage(1)

      try {
        await service.processBatch(message)
      } catch {
        // Expected
      }

      expect(mockSendEach).not.toHaveBeenCalled()
    })

    it('should record success/failure counts to circuit breaker', async () => {
      const message = createMockMessage(1)
      mockSendEach.mockResolvedValue({
        responses: [{ success: true, messageId: 'msg-1' }],
        successCount: 1,
        failureCount: 0,
      })

      await service.processBatch(message)

      expect(circuitBreaker.record).toHaveBeenCalledWith(1, 0)
    })
  })

  describe('Batch Updates', () => {
    it('should update batch sent/failed counts correctly', async () => {
      const message = createMockMessage(2)
      mockSendEach.mockResolvedValue({
        responses: [
          { success: true, messageId: 'msg-1' },
          { success: false, error: { code: 'error', message: 'Failed' } },
        ],
        successCount: 1,
        failureCount: 1,
      })

      await service.processBatch(message)

      expect(historyRepo.updateBatchCounts).toHaveBeenCalledWith('batch-123', 1, 1)
    })

    it('should handle all failures correctly', async () => {
      const message = createMockMessage(2)
      mockSendEach.mockResolvedValue({
        responses: [
          { success: false, error: { code: 'error1', message: 'Failed' } },
          { success: false, error: { code: 'error2', message: 'Failed' } },
        ],
        successCount: 0,
        failureCount: 2,
      })

      await service.processBatch(message)

      expect(historyRepo.updateBatchCounts).toHaveBeenCalledWith('batch-123', 0, 2)
    })

    it('should handle all successes correctly', async () => {
      const message = createMockMessage(2)
      mockSendEach.mockResolvedValue({
        responses: [
          { success: true, messageId: 'msg-1' },
          { success: true, messageId: 'msg-2' },
        ],
        successCount: 2,
        failureCount: 0,
      })

      await service.processBatch(message)

      expect(historyRepo.updateBatchCounts).toHaveBeenCalledWith('batch-123', 2, 0)
    })
  })
})
