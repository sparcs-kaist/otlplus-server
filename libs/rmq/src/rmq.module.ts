import { Module } from '@nestjs/common'
import { NotificationFcmPublisher } from '@otl/rmq/exchanges/notification/notification.fcm.publish'
import { RmqConnectionModule } from '@otl/rmq/rmqConnectionModule'

@Module({
  imports: [RmqConnectionModule.register()],
  providers: [NotificationFcmPublisher],
  exports: [NotificationFcmPublisher],
})
export class RmqModule {}
