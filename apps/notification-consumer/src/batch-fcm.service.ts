import { Inject, Injectable } from '@nestjs/common'
import { CircuitBreakerService } from '@otl/notification-consumer/circuit-breaker.service'
import { DeviceCleanupService } from '@otl/notification-consumer/device-cleanup.service'
import {
  ConsumerPushNotificationHistoryRepository,
  PUSH_NOTIFICATION_HISTORY_REPOSITORY,
} from '@otl/notification-consumer/out/push-notification-history.repository'
import { NotificationHistoryStatus } from '@otl/server-nest/modules/notification/domain/push-notification.enums'
import { BatchNotificationMessage } from '@otl/server-nest/modules/notification/domain/push-notification.message'
import { getMessaging } from 'firebase-admin/messaging'

import logger from '@otl/common/logger/logger'

@Injectable()
export class BatchFcmService {
  constructor(
    @Inject(PUSH_NOTIFICATION_HISTORY_REPOSITORY)
    private readonly historyRepo: ConsumerPushNotificationHistoryRepository,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly deviceCleanup: DeviceCleanupService,
  ) {}

  async processBatch(msg: BatchNotificationMessage): Promise<void> {
    // 1. Build FCM messages from recipients
    const messages = msg.recipients.map((r) => ({
      token: r.fcmToken,
      notification: { title: msg.title, body: msg.body },
      data: {
        ...msg.data,
        requestId: msg.batchId,
        notificationName: String(msg.notificationId),
      },
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          channelId: 'default',
        },
      },
      apns: {
        headers: { 'apns-priority': '10' },
        payload: { aps: { sound: 'default' } },
      },
    }))

    // 2. Circuit breaker check
    if (this.circuitBreaker.isOpen()) {
      logger.warn(`[BatchFcm] Circuit breaker is OPEN, re-queuing batch ${msg.batchId}`)
      throw new Error('FCM circuit breaker is open')
    }

    // 3. Send via FCM sendEach (max 500 per call)
    const response = await getMessaging().sendEach(messages)

    // 4. Process individual results
    const invalidTokens: string[] = []
    for (let i = 0; i < response.responses.length; i += 1) {
      const result = response.responses[i]
      const recipient = msg.recipients[i]

      if (result.success) {
        await this.historyRepo.updateStatus(recipient.historyId, NotificationHistoryStatus.SENT, {
          fcmMessageId: result.messageId,
          sentAt: new Date(),
        })
      }
      else {
        const code = result.error?.code || ''
        if (code.includes('not-registered') || code.includes('invalid-registration')) {
          invalidTokens.push(recipient.fcmToken)
        }
        await this.historyRepo.updateStatus(recipient.historyId, NotificationHistoryStatus.FAILED, {
          errorCode: code,
          errorMessage: result.error?.message,
        })
      }
    }

    // 5. Update circuit breaker
    this.circuitBreaker.record(response.successCount, response.failureCount)

    // 6. Cleanup invalid tokens
    if (invalidTokens.length > 0) {
      await this.deviceCleanup.deactivateTokens(invalidTokens)
    }

    // 7. Update batch counts
    await this.historyRepo.updateBatchCounts(msg.batchId, response.successCount, response.failureCount)

    logger.info(`[BatchFcm] Batch ${msg.batchId}: ${response.successCount} sent, ${response.failureCount} failed`)
  }
}
