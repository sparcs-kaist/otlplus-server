import { Injectable } from '@nestjs/common'
import { NotificationConsumerMQ } from '@otl/notification-consumer/out/notification.mq'
import { RabbitPublisherService } from '@otl/rmq/rabbitmq.publisher' // 👈 [1] 커스텀 Publisher 서비스 import
import settings, { ExchangeNames, QueueSymbols } from '@otl/rmq/settings'
import { FCMNotificationRequest } from '@otl/server-nest/modules/notification/domain/notification'
import { NotificationMq } from '@otl/server-nest/modules/notification/domain/notification.mq'

@Injectable()
export class NotificationFcmPublisher implements NotificationMq, NotificationConsumerMQ {
  // 👇 [2] 의존성을 RabbitPublisherService로 변경
  constructor(private readonly rabbitPublisherService: RabbitPublisherService) {}

  // 👇 [3] 각 메서드의 독립적인 구조를 유지하면서 발행 로직만 수정
  async publishNotification(request: FCMNotificationRequest): Promise<boolean> {
    const exchange = settings().getRabbitMQConfig().exchangeConfig.exchangeMap[ExchangeNames.NOTIFICATIONS]
    const routingKey = settings().getRabbitMQConfig().queueConfig[QueueSymbols.NOTI_FCM].routingKey as string
    await this.rabbitPublisherService.publishToExchange(exchange.name, routingKey, request)
    return true
  }

  async publishInfoNotification(request: FCMNotificationRequest): Promise<boolean> {
    const exchange = settings().getRabbitMQConfig().exchangeConfig.exchangeMap[ExchangeNames.NOTIFICATIONS]
    const routingKey = settings().getRabbitMQConfig().queueConfig[QueueSymbols.NOTI_INFO_FCM].routingKey as string
    await this.rabbitPublisherService.publishToExchange(exchange.name, routingKey, request)
    return true
  }

  async publishAdNotification(request: FCMNotificationRequest): Promise<boolean> {
    const exchange = settings().getRabbitMQConfig().exchangeConfig.exchangeMap[ExchangeNames.NOTIFICATIONS]
    const routingKey = settings().getRabbitMQConfig().queueConfig[QueueSymbols.NOTI_AD_FCM].routingKey as string
    await this.rabbitPublisherService.publishToExchange(exchange.name, routingKey, request)
    return true
  }

  async publishNightAdNotification(request: FCMNotificationRequest): Promise<boolean> {
    const exchange = settings().getRabbitMQConfig().exchangeConfig.exchangeMap[ExchangeNames.NOTIFICATIONS]
    const routingKey = settings().getRabbitMQConfig().queueConfig[QueueSymbols.NOTI_NIGHT_AD_FCM].routingKey as string
    await this.rabbitPublisherService.publishToExchange(exchange.name, routingKey, request)
    return true
  }
}
