import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { DynamicModule, Module } from '@nestjs/common'
import settings from '@otl/rmq/settings'

import { RmqService } from './rmq.service'

@Module({
  providers: [RmqService],
  exports: [RmqService],
})
export class RmqConnectionModule {
  static register(): DynamicModule {
    return RabbitMQModule.forRoot({
      exchanges: settings().getRabbitMQConfig().exchangeConfig.exchanges,
      uri: settings().getRabbitMQConfig().url as string,
      enableControllerDiscovery: true,
    })
  }
}
