import { Test, TestingModule } from '@nestjs/testing'
import { TargetResolverService } from '@otl/server-nest/modules/notification/services/target-resolver.service'
import {
  PUSH_NOTIFICATION_REPOSITORY,
  PushNotificationRepository,
} from '@otl/server-nest/modules/notification/domain/push-notification.repository'
import { NotificationTargetType } from '@otl/server-nest/modules/notification/domain/push-notification.enums'
import { AgreementType } from '@otl/common/enum/agreement'
import { PrismaService } from '@otl/prisma-client/prisma.service'
import { MockPushNotificationRepository } from '../mocks/push-notification.repository.mock'
import { NotificationFactory } from '../factories/notification.factory'

describe('TargetResolverService', () => {
  let service: TargetResolverService
  let repository: MockPushNotificationRepository
  let prismaFindMany: jest.Mock

  beforeEach(async () => {
    repository = new MockPushNotificationRepository()

    prismaFindMany = jest.fn()
    const mockPrisma = {
      session_userprofile: {
        findMany: prismaFindMany,
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TargetResolverService,
        {
          provide: PUSH_NOTIFICATION_REPOSITORY,
          useValue: repository,
        },
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile()

    service = module.get<TargetResolverService>(TargetResolverService)
  })

  afterEach(() => {
    repository.reset()
  })

  describe('resolveTargetUserIds - ALL Target Type', () => {
    it('should resolve all users agreed to INFO notifications', async () => {
      // Seed agreements
      repository.seedAgreements([
        NotificationFactory.createAgreement({ userId: 1, info: true, marketing: false }),
        NotificationFactory.createAgreement({ userId: 2, info: true, marketing: false }),
        NotificationFactory.createAgreement({ userId: 3, info: false, marketing: true }),
      ])

      const result = await service.resolveTargetUserIds(NotificationTargetType.ALL, null, AgreementType.INFO)

      expect(result).toEqual([1, 2])
    })

    it('should resolve all users agreed to MARKETING notifications', async () => {
      repository.seedAgreements([
        NotificationFactory.createAgreement({ userId: 1, info: true, marketing: true }),
        NotificationFactory.createAgreement({ userId: 2, info: false, marketing: true }),
        NotificationFactory.createAgreement({ userId: 3, info: true, marketing: false }),
      ])

      const result = await service.resolveTargetUserIds(NotificationTargetType.ALL, null, AgreementType.MARKETING)

      expect(result).toEqual([1, 2])
    })

    it('should resolve all users agreed to NIGHT_MARKETING notifications', async () => {
      repository.seedAgreements([
        NotificationFactory.createAgreement({ userId: 1, nightMarketing: true }),
        NotificationFactory.createAgreement({ userId: 2, nightMarketing: true }),
        NotificationFactory.createAgreement({ userId: 3, nightMarketing: false }),
      ])

      const result = await service.resolveTargetUserIds(NotificationTargetType.ALL, null, AgreementType.NIGHT_MARKETING)

      expect(result).toEqual([1, 2])
    })

    it('should return empty array when no users agreed', async () => {
      repository.seedAgreements([
        NotificationFactory.createAgreement({ userId: 1, marketing: false }),
        NotificationFactory.createAgreement({ userId: 2, marketing: false }),
      ])

      const result = await service.resolveTargetUserIds(NotificationTargetType.ALL, null, AgreementType.MARKETING)

      expect(result).toEqual([])
    })
  })

  describe('resolveTargetUserIds - SEGMENT Target Type', () => {
    beforeEach(() => {
      // Seed agreements
      repository.seedAgreements([
        NotificationFactory.createAgreement({ userId: 1, marketing: true }),
        NotificationFactory.createAgreement({ userId: 2, marketing: true }),
        NotificationFactory.createAgreement({ userId: 3, marketing: true }),
        NotificationFactory.createAgreement({ userId: 4, marketing: true }),
      ])
    })

    it('should filter by department IDs', async () => {
      prismaFindMany.mockResolvedValue([{ id: 1 }, { id: 2 }])

      const result = await service.resolveTargetUserIds(
        NotificationTargetType.SEGMENT,
        NotificationFactory.createTargetFilter({ departmentIds: [10, 20] }),
        AgreementType.MARKETING,
      )

      expect(prismaFindMany).toHaveBeenCalledWith({
        where: {
          id: { in: [1, 2, 3, 4] },
          department_id: { in: [10, 20] },
        },
        select: { id: true },
      })
      expect(result).toEqual([1, 2])
    })

    it('should filter by major IDs', async () => {
      prismaFindMany.mockResolvedValue([{ id: 2 }, { id: 3 }])

      const result = await service.resolveTargetUserIds(
        NotificationTargetType.SEGMENT,
        NotificationFactory.createTargetFilter({ majorIds: [101, 102] }),
        AgreementType.MARKETING,
      )

      expect(prismaFindMany).toHaveBeenCalledWith({
        where: {
          id: { in: [1, 2, 3, 4] },
          session_userprofile_majors: {
            some: { department_id: { in: [101, 102] } },
          },
        },
        select: { id: true },
      })
      expect(result).toEqual([2, 3])
    })

    it('should filter by yearJoinedAfter', async () => {
      prismaFindMany.mockResolvedValue([{ id: 3 }, { id: 4 }])

      const result = await service.resolveTargetUserIds(
        NotificationTargetType.SEGMENT,
        NotificationFactory.createTargetFilter({ yearJoinedAfter: 2022 }),
        AgreementType.MARKETING,
      )

      expect(prismaFindMany).toHaveBeenCalledWith({
        where: {
          id: { in: [1, 2, 3, 4] },
          date_joined: { gte: new Date(2022, 0, 1) },
        },
        select: { id: true },
      })
      expect(result).toEqual([3, 4])
    })

    it('should filter by yearJoinedBefore', async () => {
      prismaFindMany.mockResolvedValue([{ id: 1 }])

      const result = await service.resolveTargetUserIds(
        NotificationTargetType.SEGMENT,
        NotificationFactory.createTargetFilter({ yearJoinedBefore: 2020 }),
        AgreementType.MARKETING,
      )

      expect(prismaFindMany).toHaveBeenCalledWith({
        where: {
          id: { in: [1, 2, 3, 4] },
          date_joined: { lt: new Date(2021, 0, 1) },
        },
        select: { id: true },
      })
      expect(result).toEqual([1])
    })

    it('should combine multiple filters (AND logic)', async () => {
      prismaFindMany.mockResolvedValue([{ id: 2 }])

      const result = await service.resolveTargetUserIds(
        NotificationTargetType.SEGMENT,
        NotificationFactory.createTargetFilter({
          departmentIds: [10],
          yearJoinedAfter: 2020,
          yearJoinedBefore: 2023,
        }),
        AgreementType.MARKETING,
      )

      expect(prismaFindMany).toHaveBeenCalledWith({
        where: {
          id: { in: [1, 2, 3, 4] },
          department_id: { in: [10] },
          date_joined: {
            gte: new Date(2020, 0, 1),
            lt: new Date(2024, 0, 1),
          },
        },
        select: { id: true },
      })
      expect(result).toEqual([2])
    })

    it('should return empty when no filters provided', async () => {
      const result = await service.resolveTargetUserIds(NotificationTargetType.SEGMENT, null, AgreementType.MARKETING)

      expect(result).toEqual([])
    })

    it('should return empty when no matching users', async () => {
      prismaFindMany.mockResolvedValue([])

      const result = await service.resolveTargetUserIds(
        NotificationTargetType.SEGMENT,
        NotificationFactory.createTargetFilter({ departmentIds: [999] }),
        AgreementType.MARKETING,
      )

      expect(result).toEqual([])
    })

    it('should return empty when no users agreed to notification type', async () => {
      repository.reset()
      repository.seedAgreements([NotificationFactory.createAgreement({ userId: 1, marketing: false })])

      const result = await service.resolveTargetUserIds(
        NotificationTargetType.SEGMENT,
        NotificationFactory.createTargetFilter({ departmentIds: [10] }),
        AgreementType.MARKETING,
      )

      expect(result).toEqual([])
      expect(prismaFindMany).not.toHaveBeenCalled()
    })
  })

  describe('resolveTargetUserIds - MANUAL Target Type', () => {
    it('should return provided user IDs', async () => {
      const result = await service.resolveTargetUserIds(
        NotificationTargetType.MANUAL,
        NotificationFactory.createTargetFilter({ userIds: [1, 2, 3] }),
        AgreementType.INFO,
      )

      expect(result).toEqual([1, 2, 3])
    })

    it('should return empty when no userIds in filter', async () => {
      const result = await service.resolveTargetUserIds(
        NotificationTargetType.MANUAL,
        NotificationFactory.createTargetFilter({}),
        AgreementType.INFO,
      )

      expect(result).toEqual([])
    })

    it('should return empty when filter is null', async () => {
      const result = await service.resolveTargetUserIds(NotificationTargetType.MANUAL, null, AgreementType.INFO)

      expect(result).toEqual([])
    })
  })

  describe('filterByNightMarketingConsent', () => {
    beforeEach(() => {
      repository.seedAgreements([
        NotificationFactory.createAgreement({ userId: 1, nightMarketing: true }),
        NotificationFactory.createAgreement({ userId: 2, nightMarketing: false }),
        NotificationFactory.createAgreement({ userId: 3, nightMarketing: true }),
      ])
    })

    it('should filter users without night consent during night hours (22:00-08:00)', async () => {
      // Mock Date to return local time 23:00 (night time)
      const now = new Date()
      now.setHours(23, 0, 0, 0)
      jest.spyOn(global, 'Date').mockImplementation(() => now as any)

      const result = await service.filterByNightMarketingConsent([1, 2, 3], AgreementType.NIGHT_MARKETING)

      expect(result).toEqual([1, 3])

      jest.restoreAllMocks()
    })

    it('should filter users during early morning hours (before 08:00)', async () => {
      // Mock Date to return local time 06:00 (early morning)
      const now = new Date()
      now.setHours(6, 0, 0, 0)
      jest.spyOn(global, 'Date').mockImplementation(() => now as any)

      const result = await service.filterByNightMarketingConsent([1, 2, 3], AgreementType.NIGHT_MARKETING)

      expect(result).toEqual([1, 3])

      jest.restoreAllMocks()
    })

    it('should not filter during day hours (08:00-22:00)', async () => {
      // Mock Date to return local time 14:00 (day time)
      const now = new Date()
      now.setHours(14, 0, 0, 0)
      jest.spyOn(global, 'Date').mockImplementation(() => now as any)

      const result = await service.filterByNightMarketingConsent([1, 2, 3], AgreementType.NIGHT_MARKETING)

      expect(result).toEqual([1, 2, 3])

      jest.restoreAllMocks()
    })

    it('should only apply to NIGHT_MARKETING type', async () => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-01-01T23:00:00Z')) // Night time

      const result = await service.filterByNightMarketingConsent([1, 2, 3], AgreementType.MARKETING)

      expect(result).toEqual([1, 2, 3]) // Not filtered

      jest.useRealTimers()
    })

    it('should handle boundary at 22:00 (start of night)', async () => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-01-01T22:00:00Z'))

      const result = await service.filterByNightMarketingConsent([1, 2, 3], AgreementType.NIGHT_MARKETING)

      expect(result).toEqual([1, 3])

      jest.useRealTimers()
    })

    it('should handle boundary at 08:00 (end of night)', async () => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-01-01T08:00:00Z'))

      const result = await service.filterByNightMarketingConsent([1, 2, 3], AgreementType.NIGHT_MARKETING)

      expect(result).toEqual([1, 2, 3]) // 08:00 is day time

      jest.useRealTimers()
    })
  })

  describe('Unknown target type', () => {
    it('should return empty array for unknown target type', async () => {
      const result = await service.resolveTargetUserIds('UNKNOWN' as any, null, AgreementType.INFO)

      expect(result).toEqual([])
    })
  })
})
