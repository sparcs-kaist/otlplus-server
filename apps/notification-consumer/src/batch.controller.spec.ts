import { Test, TestingModule } from '@nestjs/testing'
import { BatchController } from './batch.controller'
import { BatchFcmService } from './batch-fcm.service'
import { BatchNotificationMessage } from '@otl/server-nest/modules/notification/domain/push-notification.message'

describe('BatchController', () => {
  let controller: BatchController
  let batchFcmService: jest.Mocked<BatchFcmService>

  const createMockMessage = (batchId: string = 'batch-123'): BatchNotificationMessage => ({
    batchId,
    notificationId: 1,
    type: 'INFO' as any,
    priority: 'NORMAL' as any,
    title: 'Test Title',
    body: 'Test Body',
    data: {},
    recipients: [
      {
        userId: 1,
        fcmToken: 'token-1',
        historyId: 1,
        deviceId: 1,
      },
    ],
  })

  beforeEach(async () => {
    const mockBatchFcmService = {
      processBatch: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BatchController],
      providers: [
        {
          provide: BatchFcmService,
          useValue: mockBatchFcmService,
        },
      ],
    }).compile()

    controller = module.get<BatchController>(BatchController)
    batchFcmService = module.get(BatchFcmService)
  })

  describe('handleUrgentBatch', () => {
    it('should call processBatch with urgent batch message', async () => {
      const message = createMockMessage('urgent-batch-1')
      batchFcmService.processBatch.mockResolvedValue()

      await controller.handleUrgentBatch(message)

      expect(batchFcmService.processBatch).toHaveBeenCalledWith(message)
    })

    it('should handle multiple urgent batches', async () => {
      const messages = [
        createMockMessage('urgent-batch-1'),
        createMockMessage('urgent-batch-2'),
        createMockMessage('urgent-batch-3'),
      ]
      batchFcmService.processBatch.mockResolvedValue()

      for (const message of messages) {
        await controller.handleUrgentBatch(message)
      }

      expect(batchFcmService.processBatch).toHaveBeenCalledTimes(3)
    })
  })

  describe('handleNormalBatch', () => {
    it('should call processBatch with normal batch message', async () => {
      const message = createMockMessage('normal-batch-1')
      batchFcmService.processBatch.mockResolvedValue()

      await controller.handleNormalBatch(message)

      expect(batchFcmService.processBatch).toHaveBeenCalledWith(message)
    })

    it('should handle multiple normal batches', async () => {
      const messages = [createMockMessage('normal-batch-1'), createMockMessage('normal-batch-2')]
      batchFcmService.processBatch.mockResolvedValue()

      for (const message of messages) {
        await controller.handleNormalBatch(message)
      }

      expect(batchFcmService.processBatch).toHaveBeenCalledTimes(2)
    })
  })

  describe('handleBulkBatch', () => {
    it('should call processBatch with bulk batch message', async () => {
      const message = createMockMessage('bulk-batch-1')
      batchFcmService.processBatch.mockResolvedValue()

      await controller.handleBulkBatch(message)

      expect(batchFcmService.processBatch).toHaveBeenCalledWith(message)
    })

    it('should handle multiple bulk batches', async () => {
      const messages = [createMockMessage('bulk-batch-1'), createMockMessage('bulk-batch-2')]
      batchFcmService.processBatch.mockResolvedValue()

      for (const message of messages) {
        await controller.handleBulkBatch(message)
      }

      expect(batchFcmService.processBatch).toHaveBeenCalledTimes(2)
    })
  })

  describe('DLQ Handlers', () => {
    it('should log urgent DLQ messages', () => {
      const message = createMockMessage('dlq-urgent-1')

      // Should not throw
      expect(() => controller.handleUrgentBatchDLQ(message)).not.toThrow()

      // Should not call processBatch for DLQ
      expect(batchFcmService.processBatch).not.toHaveBeenCalled()
    })

    it('should log normal DLQ messages', () => {
      const message = createMockMessage('dlq-normal-1')

      // Should not throw
      expect(() => controller.handleNormalBatchDLQ(message)).not.toThrow()

      // Should not call processBatch for DLQ
      expect(batchFcmService.processBatch).not.toHaveBeenCalled()
    })

    it('should log bulk DLQ messages', () => {
      const message = createMockMessage('dlq-bulk-1')

      // Should not throw
      expect(() => controller.handleBulkBatchDLQ(message)).not.toThrow()

      // Should not call processBatch for DLQ
      expect(batchFcmService.processBatch).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should propagate errors from processBatch', async () => {
      const message = createMockMessage('error-batch-1')
      batchFcmService.processBatch.mockRejectedValue(new Error('Processing failed'))

      await expect(controller.handleUrgentBatch(message)).rejects.toThrow('Processing failed')
    })

    it('should handle processBatch errors for normal batches', async () => {
      const message = createMockMessage('error-batch-2')
      batchFcmService.processBatch.mockRejectedValue(new Error('FCM error'))

      await expect(controller.handleNormalBatch(message)).rejects.toThrow('FCM error')
    })

    it('should handle processBatch errors for bulk batches', async () => {
      const message = createMockMessage('error-batch-3')
      batchFcmService.processBatch.mockRejectedValue(new Error('Circuit breaker open'))

      await expect(controller.handleBulkBatch(message)).rejects.toThrow('Circuit breaker open')
    })
  })

  describe('Message Processing', () => {
    it('should process batches with different notification IDs', async () => {
      const messages = [
        { ...createMockMessage('batch-1'), notificationId: 1 },
        { ...createMockMessage('batch-2'), notificationId: 2 },
        { ...createMockMessage('batch-3'), notificationId: 3 },
      ]
      batchFcmService.processBatch.mockResolvedValue()

      for (const message of messages) {
        await controller.handleNormalBatch(message)
      }

      expect(batchFcmService.processBatch).toHaveBeenCalledTimes(3)
      expect(batchFcmService.processBatch).toHaveBeenNthCalledWith(1, messages[0])
      expect(batchFcmService.processBatch).toHaveBeenNthCalledWith(2, messages[1])
      expect(batchFcmService.processBatch).toHaveBeenNthCalledWith(3, messages[2])
    })

    it('should process batches with different recipient counts', async () => {
      const smallBatch = {
        ...createMockMessage('small-batch'),
        recipients: [{ userId: 1, fcmToken: 'token-1', historyId: 1, deviceId: 1 }],
      }

      const largeBatch = {
        ...createMockMessage('large-batch'),
        recipients: Array.from({ length: 100 }, (_, i) => ({
          userId: i + 1,
          fcmToken: `token-${i + 1}`,
          historyId: i + 1,
          deviceId: i + 1,
        })),
      }

      batchFcmService.processBatch.mockResolvedValue()

      await controller.handleNormalBatch(smallBatch)
      await controller.handleBulkBatch(largeBatch)

      expect(batchFcmService.processBatch).toHaveBeenCalledTimes(2)
      expect(batchFcmService.processBatch).toHaveBeenNthCalledWith(1, smallBatch)
      expect(batchFcmService.processBatch).toHaveBeenNthCalledWith(2, largeBatch)
    })
  })
})
