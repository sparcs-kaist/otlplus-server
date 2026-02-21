import { Test, TestingModule } from '@nestjs/testing'

import { PushNotificationController } from '@otl/server-nest/modules/notification/push-notification.controller'
import {
  PUSH_NOTIFICATION_IN_PORT,
  PushNotificationInPort,
} from '@otl/server-nest/modules/notification/domain/push-notification.in.port'
import { NotificationFactory } from '../factories/notification.factory'

describe('PushNotificationController', () => {
  let controller: PushNotificationController
  let service: jest.Mocked<PushNotificationInPort>

  beforeEach(async () => {
    // Create mock service
    service = {
      createPushNotification: jest.fn(),
      updatePushNotification: jest.fn(),
      deletePushNotification: jest.fn(),
      listPushNotifications: jest.fn(),
      getPushNotification: jest.fn(),
      sendNotificationNow: jest.fn(),
      getDeliveryStatus: jest.fn(),
    } as any

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PushNotificationController],
      providers: [
        {
          provide: PUSH_NOTIFICATION_IN_PORT,
          useValue: service,
        },
      ],
    }).compile()

    controller = module.get<PushNotificationController>(PushNotificationController)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should call createPushNotification with correct params', async () => {
      const dto = {
        name: 'test-notification',
        type: 'INFO',
        titleTemplate: 'Test Title',
        bodyTemplate: 'Test Body',
        targetType: 'ALL',
        targetFilter: null,
        scheduleType: 'ONE_TIME',
        scheduleAt: new Date('2024-01-01'),
        cronExpression: null,
        priority: 'NORMAL',
        digestKey: null,
        digestWindowSec: null,
        isActive: true,
      }

      const mockResult = NotificationFactory.createPushNotification()
      service.createPushNotification.mockResolvedValue(mockResult)

      const result = await controller.create(dto as any)

      expect(service.createPushNotification).toHaveBeenCalledWith({
        name: 'test-notification',
        type: 'INFO',
        titleTemplate: 'Test Title',
        bodyTemplate: 'Test Body',
        targetType: 'ALL',
        targetFilter: null,
        scheduleType: 'ONE_TIME',
        scheduleAt: dto.scheduleAt,
        cronExpression: null,
        priority: 'NORMAL',
        digestKey: null,
        digestWindowSec: null,
        isActive: true,
      })
      expect(result).toBe(mockResult)
    })
  })

  describe('update', () => {
    it('should call updatePushNotification with ID and params', async () => {
      const dto = {
        titleTemplate: 'Updated Title',
        isActive: false,
      }

      const mockResult = NotificationFactory.createPushNotification({ id: 1 })
      service.updatePushNotification.mockResolvedValue(mockResult)

      const result = await controller.update(1, dto as any)

      expect(service.updatePushNotification).toHaveBeenCalledWith(1, dto)
      expect(result).toBe(mockResult)
    })
  })

  describe('remove', () => {
    it('should call deletePushNotification with ID', async () => {
      service.deletePushNotification.mockResolvedValue(undefined)

      await controller.remove(1)

      expect(service.deletePushNotification).toHaveBeenCalledWith(1)
    })
  })

  describe('list', () => {
    it('should call listPushNotifications', async () => {
      const mockResult = [
        NotificationFactory.createPushNotification({ id: 1 }),
        NotificationFactory.createPushNotification({ id: 2 }),
      ]
      service.listPushNotifications.mockResolvedValue(mockResult)

      const result = await controller.list()

      expect(service.listPushNotifications).toHaveBeenCalled()
      expect(result).toBe(mockResult)
    })
  })

  describe('get', () => {
    it('should call getPushNotification with ID', async () => {
      const mockResult = NotificationFactory.createPushNotification({ id: 1 })
      service.getPushNotification.mockResolvedValue(mockResult)

      const result = await controller.get(1)

      expect(service.getPushNotification).toHaveBeenCalledWith(1)
      expect(result).toBe(mockResult)
    })
  })

  describe('send', () => {
    it('should call sendNotificationNow with ID and templateVars', async () => {
      const dto = {
        templateVars: { userName: 'John' },
      }

      const mockResult = NotificationFactory.createBatch()
      service.sendNotificationNow.mockResolvedValue(mockResult)

      const result = await controller.send(1, dto as any)

      expect(service.sendNotificationNow).toHaveBeenCalledWith(1, { userName: 'John' })
      expect(result).toBe(mockResult)
    })
  })

  describe('status', () => {
    it('should call getDeliveryStatus with ID', async () => {
      const mockResult = {
        batch: NotificationFactory.createBatch(),
        histories: [NotificationFactory.createHistory()],
      }
      service.getDeliveryStatus.mockResolvedValue(mockResult as any)

      const result = await controller.status(1)

      expect(service.getDeliveryStatus).toHaveBeenCalledWith(1)
      expect(result).toBe(mockResult)
    })
  })
})
