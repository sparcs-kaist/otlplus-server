import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { DynamicModule, Module } from '@nestjs/common'
import settings from '@otl/rmq/settings'

@Module({
  providers: [],
  exports: [],
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
