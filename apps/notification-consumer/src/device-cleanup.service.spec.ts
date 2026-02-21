import { Test, TestingModule } from '@nestjs/testing'
import { DeviceCleanupService } from './device-cleanup.service'
import { PrismaService } from '@otl/prisma-client/prisma.service'

describe('DeviceCleanupService', () => {
  let service: DeviceCleanupService
  let updateManyMock: jest.Mock

  beforeEach(async () => {
    updateManyMock = jest.fn()
    const mockPrisma = {
      session_userprofile_device: {
        updateMany: updateManyMock,
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceCleanupService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile()

    service = module.get<DeviceCleanupService>(DeviceCleanupService)
  })

  describe('deactivateTokens', () => {
    it('should deactivate invalid tokens', async () => {
      const tokens = ['token-1', 'token-2', 'token-3']
      updateManyMock.mockResolvedValue({ count: 3 })

      await service.deactivateTokens(tokens)

      expect(updateManyMock).toHaveBeenCalledWith({
        where: { token: { in: tokens } },
        data: { is_active: false },
      })
    })

    it('should handle empty token list', async () => {
      await service.deactivateTokens([])

      expect(updateManyMock).not.toHaveBeenCalled()
    })

    it('should handle single token', async () => {
      const tokens = ['token-1']
      updateManyMock.mockResolvedValue({ count: 1 })

      await service.deactivateTokens(tokens)

      expect(updateManyMock).toHaveBeenCalledWith({
        where: { token: { in: tokens } },
        data: { is_active: false },
      })
    })

    it('should handle Prisma errors gracefully', async () => {
      const tokens = ['token-1']
      updateManyMock.mockRejectedValue(new Error('Database error'))

      await expect(service.deactivateTokens(tokens)).rejects.toThrow('Database error')
    })

    it('should handle large batch of tokens', async () => {
      const tokens = Array.from({ length: 100 }, (_, i) => `token-${i}`)
      updateManyMock.mockResolvedValue({ count: 100 })

      await service.deactivateTokens(tokens)

      expect(updateManyMock).toHaveBeenCalledWith({
        where: { token: { in: tokens } },
        data: { is_active: false },
      })
    })
  })
})
