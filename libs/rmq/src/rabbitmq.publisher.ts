// rabbitmq.publisher.ts
import { Injectable } from '@nestjs/common'

import { RabbitMQService } from './rmq.service'

@Injectable()
export class RabbitPublisherService {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async publishToExchange(
    exchange: string,
    routingKey: string,
    payload: any,
    options: { delay?: number } = {},
  ): Promise<void> {
    const connection = await this.rabbitMQService.getConnection()
    if (!connection) {
      throw new Error('RabbitMQ connection is not initialized')
    }
    const channel = await connection.createChannel()

    if (!channel) {
      throw new Error('RabbitMQ channel is not initialized')
    }
    await channel.assertExchange(exchange, 'x-delayed-message', {
      durable: true,
      arguments: {
        'x-delayed-type': 'direct',
      },
    })

    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
      contentType: 'application/json',
      headers: { 'x-delay': options.delay ?? 0 },
    })
  }
}
