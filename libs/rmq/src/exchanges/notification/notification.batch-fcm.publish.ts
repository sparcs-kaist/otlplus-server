import { Injectable } from '@nestjs/common'
import { RabbitPublisherService } from '@otl/rmq/rabbitmq.publisher'
import settings, { ExchangeNames, QueueSymbols } from '@otl/rmq/settings'
import { NotificationPriority } from '@otl/server-nest/modules/notification/domain/push-notification.enums'
import { BatchNotificationMessage } from '@otl/server-nest/modules/notification/domain/push-notification.message'
import { PushNotificationMq } from '@otl/server-nest/modules/notification/domain/push-notification.mq'

@Injectable()
export class NotificationBatchFcmPublisher implements PushNotificationMq {
  constructor(private readonly rabbitPublisherService: RabbitPublisherService) {}

  async publishBatch(msg: BatchNotificationMessage, priority: NotificationPriority): Promise<boolean> {
    const exchange = settings().getRabbitMQConfig().exchangeConfig.exchangeMap[ExchangeNames.NOTIFICATIONS]
    const queueSymbol = this.getQueueSymbol(priority)
    const routingKey = settings().getRabbitMQConfig().queueConfig[queueSymbol].routingKey as string
    await this.rabbitPublisherService.publishToExchange(exchange.name, routingKey, msg)
    return true
  }

  private getQueueSymbol(priority: NotificationPriority): string {
    switch (priority) {
      case NotificationPriority.URGENT:
        return QueueSymbols.NOTI_BATCH_URGENT
      case NotificationPriority.NORMAL:
        return QueueSymbols.NOTI_BATCH_NORMAL
      case NotificationPriority.LOW:
        return QueueSymbols.NOTI_BATCH_BULK
      default:
        return QueueSymbols.NOTI_BATCH_NORMAL
    }
  }
}
