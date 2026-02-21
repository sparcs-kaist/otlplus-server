import { Injectable } from '@nestjs/common'

import logger from '@otl/common/logger/logger'

import { PrismaService } from '@otl/prisma-client/prisma.service'

@Injectable()
export class DeviceCleanupService {
  constructor(private readonly prisma: PrismaService) {}

  async deactivateTokens(tokens: string[]): Promise<void> {
    if (tokens.length === 0) return

    const result = await this.prisma.session_userprofile_device.updateMany({
      where: { token: { in: tokens } },
      data: { is_active: false },
    })

    logger.info(`[DeviceCleanup] Deactivated ${result.count} devices with invalid tokens`)
  }
}
