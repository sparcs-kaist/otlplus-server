import { Module } from '@nestjs/common'
import { NotificationFcmPublisher } from '@otl/rmq/exchanges/notification/notification.fcm.publish'
import { ScholarUpdatePublisher } from '@otl/rmq/exchanges/scholar-sync/lecture.publish'
import { StatisticsUpdatePublisher } from '@otl/rmq/exchanges/statistics/statistics.publish'
import { RmqConnectionModule } from '@otl/rmq/rmqConnectionModule'

@Module({
  imports: [RmqConnectionModule.register()],
  providers: [NotificationFcmPublisher, ScholarUpdatePublisher, StatisticsUpdatePublisher],
  exports: [NotificationFcmPublisher, ScholarUpdatePublisher, StatisticsUpdatePublisher],
})
export class RmqModule {}
