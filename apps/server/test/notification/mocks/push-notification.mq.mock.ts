import { PushNotificationMq } from '@otl/server-nest/modules/notification/domain/push-notification.mq'
import { BatchNotificationMessage } from '@otl/server-nest/modules/notification/domain/push-notification.message'
import { NotificationPriority } from '@otl/server-nest/modules/notification/domain/push-notification.enums'

export class MockPushNotificationMq implements PushNotificationMq {
  public publishedMessages: Array<{
    message: BatchNotificationMessage
    priority: NotificationPriority
  }> = []

  async publishBatch(message: BatchNotificationMessage, priority: NotificationPriority): Promise<boolean> {
    this.publishedMessages.push({
      message: { ...message },
      priority,
    })
    return true
  }

  reset(): void {
    this.publishedMessages = []
  }

  getMessagesByPriority(priority: NotificationPriority): BatchNotificationMessage[] {
    return this.publishedMessages.filter((m) => m.priority === priority).map((m) => m.message)
  }

  getTotalMessageCount(): number {
    return this.publishedMessages.length
  }

  getLastMessage(): BatchNotificationMessage | undefined {
    return this.publishedMessages[this.publishedMessages.length - 1]?.message
  }

  getMessagesByBatchId(batchId: string): BatchNotificationMessage[] {
    return this.publishedMessages.filter((m) => m.message.batchId === batchId).map((m) => m.message)
  }
}
