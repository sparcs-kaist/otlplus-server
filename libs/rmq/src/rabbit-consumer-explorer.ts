// @otl/rmq/rabbit-consumer-explorer.ts
import { Injectable, OnModuleInit } from '@nestjs/common'
import { DiscoveryService, Reflector } from '@nestjs/core'
import { RABBIT_CONSUMER_METADATA, RabbitConsumerMetadata } from '@otl/rmq/decorator/rabbit-consumer.decorator'
import { RabbitMQService } from '@otl/rmq/rmq.service'
import settings from '@otl/rmq/settings'
import { Channel } from 'amqplib'

import logger from '@otl/common/logger/logger'

const MAX_RETRIES = 3
const RETRY_DELAYS = [10000, 20000, 30000] // 10초, 20초, 30초
const CONSUME_TIMEOUT = 5000 // 5초

@Injectable()
export class RabbitConsumerExplorer implements OnModuleInit {
  private readonly config = settings().getRabbitMQConfig()

  private readonly logger = logger

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  onModuleInit() {
    this.discoverAndBindConsumers()
  }

  private discoverAndBindConsumers() {
    const providers = this.discoveryService.getProviders()
    for (const wrapper of providers) {
      if (!wrapper.instance || !wrapper.metatype) continue

      const { instance } = wrapper
      const prototype = Object.getPrototypeOf(instance)
      if (!prototype) continue

      const methodNames = Object.getOwnPropertyNames(prototype).filter(
        (name) => typeof instance[name] === 'function' && name !== 'constructor',
      )

      for (const methodName of methodNames) {
        const method = instance[methodName]
        const metadata = this.reflector.get<RabbitConsumerMetadata>(RABBIT_CONSUMER_METADATA, method)

        if (metadata) {
          this.setupConsumer(instance, method, metadata, methodName)
        }
      }
    }
  }

  private async setupConsumer(
    instance: object,
    method: (payload: any) => Promise<void>,
    metadata: RabbitConsumerMetadata,
    methodName: string,
  ) {
    const { queueSymbol, options } = metadata
    const queueConfig = this.config.queueConfig[queueSymbol]

    if (!queueConfig || !queueConfig.queue) {
      this.logger.error(`Queue configuration for "${queueSymbol}" is missing or invalid.`)
      return
    }

    const exchangeConfig = this.config.exchangeConfig.exchangeMap[queueConfig.exchange as string]
    if (!exchangeConfig) {
      this.logger.error(`Exchange configuration for "${queueConfig.exchange}" not found.`)
      return
    }

    try {
      const connection = await this.rabbitMQService.getConnection()
      const channel = await connection.createChannel()
      channel.on('error', (err) => {
        this.logger.error(`💥 Channel Error for queue ${queueConfig.queue}`, err.stack)
      })

      //  Prefetch 설정
      await channel.prefetch(options.prefetch ?? 5)

      // Exchange, Queue, Binding 설정
      await channel.assertExchange(exchangeConfig.name, exchangeConfig.type as string, exchangeConfig.options || {})
      await channel.assertQueue(queueConfig.queue, queueConfig.queueOptions || {})
      await channel.bindQueue(queueConfig.queue, exchangeConfig.name, queueConfig.routingKey as string)

      // 메시지 소비 시작
      this.consumeIndividually(channel, queueConfig, instance, method, options)

      this.logger.info(
        `🐇 Consumer setup successful for ${instance.constructor.name}.${methodName} on queue: ${queueConfig.queue}`,
      )
    }
    catch (err: any) {
      this.logger.error(`❌ Failed to setup consumer for queue ${queueConfig.queue}`, err.stack)
    }
  }

  /**
   * 메시지를 개별적으로 처리하는 컨슈머
   */
  private consumeIndividually(
    channel: Channel,
    queueConfig: any,
    instance: object,
    method: (payload: any) => Promise<void>,
    options: RabbitConsumerMetadata['options'],
  ) {
    channel.consume(queueConfig.queue, async (msg) => {
      if (!msg) return

      const currentRetry = msg?.properties?.headers?.['x-retry-count'] || 0
      const consumeTimeout = options.timeout ?? CONSUME_TIMEOUT

      try {
        await Promise.race([
          method.call(instance, msg),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Consumer timeout')), consumeTimeout)
          }),
        ])
        channel.ack(msg)
      }
      catch (err: any) {
        const exchangeName = this.config.exchangeConfig.exchangeMap[queueConfig.exchange].name

        if (currentRetry < MAX_RETRIES) {
          // ✅ 원래 큐로 다시 보내되, x-delay 헤더로 지연 시간 설정
          const delay = RETRY_DELAYS[currentRetry]
          this.logger.warn(
            `Retrying message for queue ${queueConfig.queue}. Delay: ${delay}ms (Attempt: ${currentRetry + 1}) Error: ${err.message}`,
          )

          channel.publish(exchangeName, queueConfig.routingKey, msg.content, {
            ...msg.properties,
            headers: {
              ...msg.properties.headers,
              'x-retry-count': currentRetry + 1,
              'x-delay': delay, // x-delayed-message 플러그인
            },
          })
        }
        else {
          this.logger.error(`Max retries reached. Sending to DLQ for queue ${queueConfig.queue}`)
          channel.nack(msg, false, false)
          return
        }

        channel.ack(msg)
      }
    })
  }
}
