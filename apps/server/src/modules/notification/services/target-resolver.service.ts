import { Inject, Injectable } from '@nestjs/common'
import { TargetFilter } from '@otl/server-nest/modules/notification/domain/push-notification.domain'
import { NotificationTargetType } from '@otl/server-nest/modules/notification/domain/push-notification.enums'
import {
  PUSH_NOTIFICATION_REPOSITORY,
  PushNotificationRepository,
} from '@otl/server-nest/modules/notification/domain/push-notification.repository'

import { AgreementType } from '@otl/common/enum/agreement'
import logger from '@otl/common/logger/logger'

import { PrismaService } from '@otl/prisma-client/prisma.service'

@Injectable()
export class TargetResolverService {
  constructor(
    @Inject(PUSH_NOTIFICATION_REPOSITORY)
    private readonly pushNotificationRepository: PushNotificationRepository,
    private readonly prisma: PrismaService,
  ) {}

  async resolveTargetUserIds(
    targetType: NotificationTargetType,
    targetFilter: TargetFilter | null,
    notificationType: string,
  ): Promise<number[]> {
    switch (targetType) {
      case NotificationTargetType.ALL:
        return this.resolveAll(notificationType)

      case NotificationTargetType.SEGMENT:
        return this.resolveSegment(targetFilter, notificationType)

      case NotificationTargetType.MANUAL:
        return this.resolveManual(targetFilter)

      default:
        logger.warn(`[TargetResolver] Unknown target type: ${targetType}`)
        return []
    }
  }

  private async resolveAll(notificationType: string): Promise<number[]> {
    return this.pushNotificationRepository.getAgreedUserIds(notificationType)
  }

  private async resolveSegment(targetFilter: TargetFilter | null, notificationType: string): Promise<number[]> {
    if (!targetFilter) return []

    const agreedUserIds = await this.pushNotificationRepository.getAgreedUserIds(notificationType)
    if (agreedUserIds.length === 0) return []

    const where: Record<string, unknown> = {
      id: { in: agreedUserIds },
    }

    if (targetFilter.departmentIds && targetFilter.departmentIds.length > 0) {
      where.department_id = { in: targetFilter.departmentIds }
    }

    if (targetFilter.majorIds && targetFilter.majorIds.length > 0) {
      where.session_userprofile_majors = {
        some: { department_id: { in: targetFilter.majorIds } },
      }
    }

    if (targetFilter.yearJoinedAfter) {
      const afterDate = new Date(targetFilter.yearJoinedAfter, 0, 1)
      where.date_joined = { ...((where.date_joined as Record<string, unknown>) || {}), gte: afterDate }
    }

    if (targetFilter.yearJoinedBefore) {
      const beforeDate = new Date(targetFilter.yearJoinedBefore + 1, 0, 1)
      where.date_joined = { ...((where.date_joined as Record<string, unknown>) || {}), lt: beforeDate }
    }

    const users = await this.prisma.session_userprofile.findMany({
      where,
      select: { id: true },
    })

    return users.map((u) => u.id)
  }

  private resolveManual(targetFilter: TargetFilter | null): number[] {
    if (!targetFilter?.userIds) return []
    return targetFilter.userIds
  }

  async filterByNightMarketingConsent(userIds: number[], notificationType: string): Promise<number[]> {
    if (notificationType !== AgreementType.NIGHT_MARKETING) return userIds

    const now = new Date()
    const hour = now.getHours()
    const isNight = hour >= 22 || hour < 8

    if (!isNight) return userIds

    // Filter out users who haven't agreed to night marketing
    const nightAgreedUserIds = await this.pushNotificationRepository.getAgreedUserIds(AgreementType.NIGHT_MARKETING)
    const nightAgreedSet = new Set(nightAgreedUserIds)
    return userIds.filter((id) => nightAgreedSet.has(id))
  }
}
