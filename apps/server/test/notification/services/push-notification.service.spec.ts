import { Test, TestingModule } from '@nestjs/testing'
import { PushNotificationService } from '@otl/server-nest/modules/notification/push-notification.service'
import {
  PUSH_NOTIFICATION_REPOSITORY,
  PushNotificationRepository,
} from '@otl/server-nest/modules/notification/domain/push-notification.repository'
import {
  PUSH_NOTIFICATION_MQ,
  PushNotificationMq,
} from '@otl/server-nest/modules/notification/domain/push-notification.mq'
import { DEVICE_REPOSITORY, DeviceRepository } from '@otl/server-nest/modules/device/domain/device.repository'
import { TemplateEngineService } from '@otl/server-nest/modules/notification/services/template-engine.service'
import { RateLimiterService } from '@otl/server-nest/modules/notification/services/rate-limiter.service'
import { TargetResolverService } from '@otl/server-nest/modules/notification/services/target-resolver.service'
import { MockPushNotificationRepository } from '../mocks/push-notification.repository.mock'
import { MockPushNotificationMq } from '../mocks/push-notification.mq.mock'
import { NotificationFactory } from '../factories/notification.factory'
import { AgreementType } from '@otl/common/enum/agreement'
import {
  NotificationTargetType,
  NotificationPriority,
  BatchStatus,
} from '@otl/server-nest/modules/notification/domain/push-notification.enums'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { MockCacheManager } from '../mocks/cache-manager.mock'
import { PrismaService } from '@otl/prisma-client/prisma.service'

describe('PushNotificationService', () => {
  let service: PushNotificationService
  let repository: MockPushNotificationRepository
  let mqService: MockPushNotificationMq
  let deviceRepository: any
  let templateEngine: TemplateEngineService
  let rateLimiter: RateLimiterService
  let targetResolver: TargetResolverService
  let cacheManager: MockCacheManager
  let mockDevices: any[]

  beforeEach(async () => {
    repository = new MockPushNotificationRepository()
    mqService = new MockPushNotificationMq()
    cacheManager = new MockCacheManager()
    mockDevices = []

    // Mock device repository
    const mockDeviceRepo = {
      findActiveDevicesByUserIds: jest.fn().mockImplementation(async (userIds: number[]) => {
        return mockDevices.filter((d) => userIds.includes(d.userId) && d.isActive)
      }),
    }
    deviceRepository = mockDeviceRepo

    // Mock Prisma for TargetResolver
    const mockPrisma = {
      session_userprofile: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushNotificationService,
        { provide: PUSH_NOTIFICATION_REPOSITORY, useValue: repository },
        { provide: PUSH_NOTIFICATION_MQ, useValue: mqService },
        { provide: DEVICE_REPOSITORY, useValue: deviceRepository },
        { provide: CACHE_MANAGER, useValue: cacheManager },
        { provide: PrismaService, useValue: mockPrisma },
        TemplateEngineService,
        RateLimiterService,
        TargetResolverService,
      ],
    }).compile()

    service = module.get<PushNotificationService>(PushNotificationService)
    templateEngine = module.get(TemplateEngineService)
    rateLimiter = module.get(RateLimiterService)
    targetResolver = module.get(TargetResolverService)
  })

  afterEach(() => {
    repository.reset()
    mqService.reset()
    mockDevices = []
    NotificationFactory.reset()
  })

  describe('CRUD Operations', () => {
    it('should create push notification with all fields', async () => {
      const data = {
        name: 'test-notification',
        type: AgreementType.INFO,
        titleTemplate: 'Hello {{name}}',
        bodyTemplate: 'Welcome {{name}}',
        targetType: NotificationTargetType.ALL,
        targetFilter: null,
        scheduleType: 'IMMEDIATE' as any,
        scheduleAt: null,
        cronExpression: null,
        priority: NotificationPriority.NORMAL,
        digestKey: null,
        digestWindowSec: null,
        isActive: true,
        createdBy: 1,
      }

      const result = await service.createPushNotification(data)

      expect(result.id).toBeDefined()
      expect(result.name).toBe('test-notification')
      expect(result.type).toBe(AgreementType.INFO)
      expect(result.titleTemplate).toBe('Hello {{name}}')
    })

    it('should create with default values', async () => {
      const data = {
        name: 'minimal-notification',
        type: AgreementType.INFO,
        titleTemplate: 'Title',
        bodyTemplate: 'Body',
        targetType: NotificationTargetType.ALL,
        scheduleType: 'IMMEDIATE' as any,
      }

      const result = await service.createPushNotification(data)

      expect(result.priority).toBe('NORMAL')
      expect(result.isActive).toBe(true)
      expect(result.targetFilter).toBeNull()
    })

    it('should update notification fields', async () => {
      const notification = NotificationFactory.createPushNotification({ name: 'original' })
      repository.seedNotifications([notification])

      const updated = await service.updatePushNotification(notification.id, {
        name: 'updated',
        titleTemplate: 'New Title',
      })

      expect(updated.name).toBe('updated')
      expect(updated.titleTemplate).toBe('New Title')
    })

    it('should delete notification', async () => {
      const notification = NotificationFactory.createPushNotification()
      repository.seedNotifications([notification])

      await service.deletePushNotification(notification.id)

      const result = await service.getPushNotification(notification.id)
      expect(result).toBeNull()
    })

    it('should get notification by ID', async () => {
      const notification = NotificationFactory.createPushNotification()
      repository.seedNotifications([notification])

      const result = await service.getPushNotification(notification.id)

      expect(result).toEqual(notification)
    })

    it('should list all notifications', async () => {
      const notifications = [
        NotificationFactory.createPushNotification({ name: 'notif-1' }),
        NotificationFactory.createPushNotification({ name: 'notif-2' }),
        NotificationFactory.createPushNotification({ name: 'notif-3' }),
      ]
      repository.seedNotifications(notifications)

      const result = await service.listPushNotifications()

      expect(result).toHaveLength(3)
    })
  })

  describe('Send Flow', () => {
    it('should throw error when notification not found', async () => {
      await expect(service.sendNotificationNow(999)).rejects.toThrow('Push notification not found')
    })

    it('should render templates with provided variables', async () => {
      const notification = NotificationFactory.createPushNotification({
        titleTemplate: 'Hello {{name}}',
        bodyTemplate: 'You have {{count}} messages',
        targetType: NotificationTargetType.MANUAL,
        targetFilter: { userIds: [1] },
      })
      repository.seedNotifications([notification])
      repository.seedAgreements([NotificationFactory.createAgreement({ userId: 1, info: true })])
      mockDevices = [NotificationFactory.createUserDevice({ userId: 1, deviceToken: 'token-1' })]

      await service.sendNotificationNow(notification.id, { name: 'Alice', count: '5' })

      expect(mqService.publishedMessages).toHaveLength(1)
      expect(mqService.publishedMessages[0].message.title).toBe('Hello Alice')
      expect(mqService.publishedMessages[0].message.body).toBe('You have 5 messages')
    })

    it('should render templates without variables', async () => {
      const notification = NotificationFactory.createPushNotification({
        titleTemplate: 'Static Title',
        bodyTemplate: 'Static Body',
        targetType: NotificationTargetType.MANUAL,
        targetFilter: { userIds: [1] },
      })
      repository.seedNotifications([notification])
      repository.seedAgreements([NotificationFactory.createAgreement({ userId: 1, info: true })])
      mockDevices = [NotificationFactory.createUserDevice({ userId: 1 })]

      await service.sendNotificationNow(notification.id)

      expect(mqService.publishedMessages[0].message.title).toBe('Static Title')
      expect(mqService.publishedMessages[0].message.body).toBe('Static Body')
    })

    it('should resolve ALL target users', async () => {
      const notification = NotificationFactory.createPushNotification({
        targetType: NotificationTargetType.ALL,
        type: AgreementType.INFO,
      })
      repository.seedNotifications([notification])
      repository.seedAgreements([
        NotificationFactory.createAgreement({ userId: 1, info: true }),
        NotificationFactory.createAgreement({ userId: 2, info: true }),
        NotificationFactory.createAgreement({ userId: 3, info: false }),
      ])
      mockDevices = [
        NotificationFactory.createUserDevice({ userId: 1 }),
        NotificationFactory.createUserDevice({ userId: 2 }),
      ]

      await service.sendNotificationNow(notification.id)

      expect(mqService.publishedMessages).toHaveLength(1)
      expect(mqService.publishedMessages[0].message.recipients).toHaveLength(2)
    })

    it('should resolve MANUAL target users', async () => {
      const notification = NotificationFactory.createPushNotification({
        targetType: NotificationTargetType.MANUAL,
        targetFilter: { userIds: [1, 2] },
      })
      repository.seedNotifications([notification])
      repository.seedAgreements([
        NotificationFactory.createAgreement({ userId: 1, info: true }),
        NotificationFactory.createAgreement({ userId: 2, info: true }),
      ])
      mockDevices = [
        NotificationFactory.createUserDevice({ userId: 1 }),
        NotificationFactory.createUserDevice({ userId: 2 }),
      ]

      await service.sendNotificationNow(notification.id)

      expect(mqService.publishedMessages[0].message.recipients).toHaveLength(2)
      expect(mqService.publishedMessages[0].message.recipients.map((r) => r.userId)).toEqual([1, 2])
    })

    it('should apply rate limiting per user', async () => {
      const notification = NotificationFactory.createPushNotification({
        type: AgreementType.MARKETING,
        targetType: NotificationTargetType.MANUAL,
        targetFilter: { userIds: [1, 2, 3] },
      })
      repository.seedNotifications([notification])
      repository.seedAgreements([
        NotificationFactory.createAgreement({ userId: 1, marketing: true }),
        NotificationFactory.createAgreement({ userId: 2, marketing: true }),
        NotificationFactory.createAgreement({ userId: 3, marketing: true }),
      ])
      mockDevices = [
        NotificationFactory.createUserDevice({ userId: 1 }),
        NotificationFactory.createUserDevice({ userId: 2 }),
        NotificationFactory.createUserDevice({ userId: 3 }),
      ]

      // Mock rate limiter to block user 2
      jest
        .spyOn(rateLimiter, 'checkRateLimit')
        .mockResolvedValueOnce(true) // user 1 allowed
        .mockResolvedValueOnce(false) // user 2 blocked
        .mockResolvedValueOnce(true) // user 3 allowed

      await service.sendNotificationNow(notification.id)

      // Should only send to users 1 and 3
      const message = mqService.getLastMessage()
      expect(message!.recipients).toHaveLength(2)
      expect(message!.recipients.map((r) => r.userId)).toEqual([1, 3])
    })

    it('should skip rate-limited users', async () => {
      const notification = NotificationFactory.createPushNotification({
        type: AgreementType.MARKETING,
        targetType: NotificationTargetType.MANUAL,
        targetFilter: { userIds: [1, 2] },
      })
      repository.seedNotifications([notification])
      repository.seedAgreements([
        NotificationFactory.createAgreement({ userId: 1, marketing: true }),
        NotificationFactory.createAgreement({ userId: 2, marketing: true }),
      ])
      mockDevices = [
        NotificationFactory.createUserDevice({ userId: 1 }),
        NotificationFactory.createUserDevice({ userId: 2 }),
      ]

      // Block all users
      jest.spyOn(rateLimiter, 'checkRateLimit').mockResolvedValue(false)

      const batch = await service.sendNotificationNow(notification.id)

      expect(batch.totalCount).toBe(0)
      expect(batch.status).toBe(BatchStatus.COMPLETED)
      expect(mqService.publishedMessages).toHaveLength(0)
    })

    it('should return completed batch when no target users', async () => {
      const notification = NotificationFactory.createPushNotification({
        targetType: NotificationTargetType.MANUAL,
        targetFilter: { userIds: [] },
      })
      repository.seedNotifications([notification])

      const batch = await service.sendNotificationNow(notification.id)

      expect(batch.totalCount).toBe(0)
      expect(batch.status).toBe(BatchStatus.COMPLETED)
      expect(mqService.publishedMessages).toHaveLength(0)
    })

    it('should return completed batch when no active devices', async () => {
      const notification = NotificationFactory.createPushNotification({
        targetType: NotificationTargetType.MANUAL,
        targetFilter: { userIds: [1] },
      })
      repository.seedNotifications([notification])
      repository.seedAgreements([NotificationFactory.createAgreement({ userId: 1, info: true })])
      // No devices

      const batch = await service.sendNotificationNow(notification.id)

      expect(batch.totalCount).toBe(0)
      expect(batch.status).toBe(BatchStatus.COMPLETED)
    })

    it('should create batch with correct counts', async () => {
      const notification = NotificationFactory.createPushNotification({
        targetType: NotificationTargetType.MANUAL,
        targetFilter: { userIds: [1, 2] },
      })
      repository.seedNotifications([notification])
      repository.seedAgreements([
        NotificationFactory.createAgreement({ userId: 1, info: true }),
        NotificationFactory.createAgreement({ userId: 2, info: true }),
      ])
      mockDevices = [
        NotificationFactory.createUserDevice({ userId: 1 }),
        NotificationFactory.createUserDevice({ userId: 2 }),
      ]

      const batch = await service.sendNotificationNow(notification.id)

      expect(batch.totalCount).toBe(2)
      expect(batch.sentCount).toBe(0)
      expect(batch.failedCount).toBe(0)
      expect(batch.status).toBe(BatchStatus.PROCESSING)
    })

    it('should create history records for all devices', async () => {
      const notification = NotificationFactory.createPushNotification({
        targetType: NotificationTargetType.MANUAL,
        targetFilter: { userIds: [1, 2] },
      })
      repository.seedNotifications([notification])
      repository.seedAgreements([
        NotificationFactory.createAgreement({ userId: 1, info: true }),
        NotificationFactory.createAgreement({ userId: 2, info: true }),
      ])
      mockDevices = [
        NotificationFactory.createUserDevice({ userId: 1 }),
        NotificationFactory.createUserDevice({ userId: 2 }),
      ]

      await service.sendNotificationNow(notification.id)

      const histories = repository.getHistories()
      expect(histories).toHaveLength(2)
      expect(histories[0].status).toBe('QUEUED')
      expect(histories[1].status).toBe('QUEUED')
    })

    it('should chunk recipients into 500-size batches', async () => {
      const userIds = Array.from({ length: 1500 }, (_, i) => i + 1)
      const notification = NotificationFactory.createPushNotification({
        targetType: NotificationTargetType.MANUAL,
        targetFilter: { userIds },
      })
      repository.seedNotifications([notification])

      // Seed agreements and devices for 1500 users
      userIds.forEach((userId) => {
        repository.seedAgreements([NotificationFactory.createAgreement({ userId, info: true })])
        mockDevices.push(NotificationFactory.createUserDevice({ userId, deviceToken: `token-${userId}` }))
      })

      await service.sendNotificationNow(notification.id)

      // Should create 3 messages (500 + 500 + 500)
      expect(mqService.publishedMessages).toHaveLength(3)
      expect(mqService.publishedMessages[0].message.recipients).toHaveLength(500)
      expect(mqService.publishedMessages[1].message.recipients).toHaveLength(500)
      expect(mqService.publishedMessages[2].message.recipients).toHaveLength(500)
    })

    it('should publish to RabbitMQ with correct priority', async () => {
      const notification = NotificationFactory.createPushNotification({
        targetType: NotificationTargetType.MANUAL,
        targetFilter: { userIds: [1] },
        priority: NotificationPriority.URGENT,
      })
      repository.seedNotifications([notification])
      repository.seedAgreements([NotificationFactory.createAgreement({ userId: 1, info: true })])
      mockDevices = [NotificationFactory.createUserDevice({ userId: 1 })]

      await service.sendNotificationNow(notification.id)

      expect(mqService.publishedMessages).toHaveLength(1)
      expect(mqService.publishedMessages[0].priority).toBe(NotificationPriority.URGENT)
    })

    it('should handle exactly 500 recipients (boundary)', async () => {
      const userIds = Array.from({ length: 500 }, (_, i) => i + 1)
      const notification = NotificationFactory.createPushNotification({
        targetType: NotificationTargetType.MANUAL,
        targetFilter: { userIds },
      })
      repository.seedNotifications([notification])

      userIds.forEach((userId) => {
        repository.seedAgreements([NotificationFactory.createAgreement({ userId, info: true })])
        mockDevices.push(NotificationFactory.createUserDevice({ userId }))
      })

      await service.sendNotificationNow(notification.id)

      expect(mqService.publishedMessages).toHaveLength(1)
      expect(mqService.publishedMessages[0].message.recipients).toHaveLength(500)
    })

    it('should handle 501 recipients (create 2 messages)', async () => {
      const userIds = Array.from({ length: 501 }, (_, i) => i + 1)
      const notification = NotificationFactory.createPushNotification({
        targetType: NotificationTargetType.MANUAL,
        targetFilter: { userIds },
      })
      repository.seedNotifications([notification])

      userIds.forEach((userId) => {
        repository.seedAgreements([NotificationFactory.createAgreement({ userId, info: true })])
        mockDevices.push(NotificationFactory.createUserDevice({ userId }))
      })

      await service.sendNotificationNow(notification.id)

      expect(mqService.publishedMessages).toHaveLength(2)
      expect(mqService.publishedMessages[0].message.recipients).toHaveLength(500)
      expect(mqService.publishedMessages[1].message.recipients).toHaveLength(1)
    })

    it('should handle multiple devices per user', async () => {
      const notification = NotificationFactory.createPushNotification({
        targetType: NotificationTargetType.MANUAL,
        targetFilter: { userIds: [1] },
      })
      repository.seedNotifications([notification])
      repository.seedAgreements([NotificationFactory.createAgreement({ userId: 1, info: true })])

      // User 1 has 2 devices
      mockDevices = [
        NotificationFactory.createUserDevice({ userId: 1, deviceToken: 'token-1a' }),
        NotificationFactory.createUserDevice({ userId: 1, deviceToken: 'token-1b' }),
      ]

      await service.sendNotificationNow(notification.id)

      // Should send to both devices
      expect(mqService.publishedMessages[0].message.recipients).toHaveLength(2)
      expect(mqService.publishedMessages[0].message.recipients.map((r) => r.fcmToken)).toEqual(['token-1a', 'token-1b'])
    })

    it('should update batch status to PROCESSING', async () => {
      const notification = NotificationFactory.createPushNotification({
        targetType: NotificationTargetType.MANUAL,
        targetFilter: { userIds: [1] },
      })
      repository.seedNotifications([notification])
      repository.seedAgreements([NotificationFactory.createAgreement({ userId: 1, info: true })])
      mockDevices = [NotificationFactory.createUserDevice({ userId: 1 })]

      const batch = await service.sendNotificationNow(notification.id)

      expect(batch.status).toBe(BatchStatus.PROCESSING)
    })
  })

  describe('Delivery Status', () => {
    it('should return latest batch with histories', async () => {
      const notification = NotificationFactory.createPushNotification()
      repository.seedNotifications([notification])

      const batch = NotificationFactory.createBatch({ notificationId: notification.id })
      repository.seedBatches([batch])

      const history1 = NotificationFactory.createHistory({ batchId: batch.id, userId: 1 })
      const history2 = NotificationFactory.createHistory({ batchId: batch.id, userId: 2 })
      repository.seedHistories([history1, history2])

      const result = await service.getDeliveryStatus(notification.id)

      expect(result.batch).toEqual(batch)
      expect(result.histories).toHaveLength(2)
    })

    it('should return null when no batch exists', async () => {
      const result = await service.getDeliveryStatus(999)

      expect(result.batch).toBeNull()
      expect(result.histories).toEqual([])
    })
  })
})
