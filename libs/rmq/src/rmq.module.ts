import { DynamicModule, Module } from '@nestjs/common'
import { ClientsModule, RmqOptions, Transport } from '@nestjs/microservices'
import settings, { QueueNames } from '@otl/rmq/settings'

import { RmqService } from './rmq.service'

export const queueList = Object.values(QueueNames)
export const queueModuleFactory = () => queueList.map(
  (queueName) => ({
    name: queueName,
    transport: Transport.RMQ,
    options: settings()
      .getRabbitMQConfig()
      .queueConfig.find((opt) => opt.name === queueName),
  }) as RmqOptions as RmqOptions & { name: string | symbol },
)

@Module({
  providers: [RmqService],
  exports: [RmqService],
})
export class RmqModule {
  static register(queueNameList?: QueueNames[]): DynamicModule {
    if (!queueNameList) {
      return {
        module: RmqModule,
        imports: [ClientsModule.register(queueModuleFactory())],
        exports: [ClientsModule],
      }
    }
    return {
      module: RmqModule,
      imports: [ClientsModule.registerAsync(queueModuleFactory())],
      exports: [ClientsModule],
    }
  }
}
