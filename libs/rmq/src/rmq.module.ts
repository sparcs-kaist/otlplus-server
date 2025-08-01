import { Module } from '@nestjs/common'
import { DiscoveryModule } from '@nestjs/core'
import { NotificationFcmPublisher } from '@otl/rmq/exchanges/notification/notification.fcm.publish'
import { ScholarUpdatePublisher } from '@otl/rmq/exchanges/scholar-sync/scholar.publish'
import { StatisticsUpdatePublisher } from '@otl/rmq/exchanges/statistics/statistics.publish.v2'
import { RabbitConsumerExplorer } from '@otl/rmq/rabbit-consumer-explorer'
import { RabbitPublisherService } from '@otl/rmq/rabbitmq.publisher'
import { RabbitMQService } from '@otl/rmq/rmq.service'
import { RmqConnectionModule } from '@otl/rmq/rmqConnectionModule'

@Module({
  imports: [RmqConnectionModule.register(), DiscoveryModule],
  providers: [
    RabbitMQService,
    RabbitConsumerExplorer,
    RabbitPublisherService,
    NotificationFcmPublisher,
    ScholarUpdatePublisher,
    StatisticsUpdatePublisher,
  ],
  exports: [
    NotificationFcmPublisher,
    ScholarUpdatePublisher,
    StatisticsUpdatePublisher,
    RabbitMQService,
    RabbitConsumerExplorer,
    RabbitPublisherService,
    DiscoveryModule,
  ],
})
export class RmqModule {}
