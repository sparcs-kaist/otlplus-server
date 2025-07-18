import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import { NotificationConsumerMQ } from '@otl/notification-consumer/out/notification.mq'
import settings, { ExchangeNames, QueueSymbols } from '@otl/rmq/settings'
import { FCMNotificationRequest } from '@otl/server-nest/modules/notification/domain/notification'
import { NotificationMq } from '@otl/server-nest/modules/notification/domain/notification.mq'

@Injectable()
export class NotificationFcmPublisher implements NotificationMq, NotificationConsumerMQ {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publishNotification(request: FCMNotificationRequest): Promise<boolean> {
    const exchange = settings().getRabbitMQConfig().exchangeConfig.exchangeMap[ExchangeNames.NOTIFICATIONS]
    const routingKey = settings().getRabbitMQConfig().queueConfig[QueueSymbols.NOTI_FCM].routingKey as string
    return await this.amqpConnection.publish(exchange.name, routingKey, request)
  }

  async publishInfoNotification(request: FCMNotificationRequest): Promise<boolean> {
    const exchange = settings().getRabbitMQConfig().exchangeConfig.exchangeMap[ExchangeNames.NOTIFICATIONS]
    const routingKey = settings().getRabbitMQConfig().queueConfig[QueueSymbols.NOTI_INFO_FCM].routingKey as string
    return await this.amqpConnection.publish(exchange.name, routingKey, request)
  }

  async publishAdNotification(request: FCMNotificationRequest): Promise<boolean> {
    const exchange = settings().getRabbitMQConfig().exchangeConfig.exchangeMap[ExchangeNames.NOTIFICATIONS]
    const routingKey = settings().getRabbitMQConfig().queueConfig[QueueSymbols.NOTI_AD_FCM].routingKey as string
    return await this.amqpConnection.publish(exchange.name, routingKey, request)
  }

  async publishNightAdNotification(request: FCMNotificationRequest): Promise<boolean> {
    const exchange = settings().getRabbitMQConfig().exchangeConfig.exchangeMap[ExchangeNames.NOTIFICATIONS]
    const routingKey = settings().getRabbitMQConfig().queueConfig[QueueSymbols.NOTI_NIGHT_AD_FCM].routingKey as string
    return await this.amqpConnection.publish(exchange.name, routingKey, request)
  }
}
