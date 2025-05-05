import { Injectable } from '@nestjs/common'
import { RmqOptions, Transport } from '@nestjs/microservices'
import settings, { QueueNames } from '@otl/rmq/settings'

@Injectable()
export class RmqService {
  constructor() {}

  getOptions(queue: QueueNames): RmqOptions {
    return {
      transport: Transport.RMQ,
      options: settings()
        .getRabbitMQConfig()
        .queueConfig.find((opt) => opt.name === queue),
    } as RmqOptions
  }
}
