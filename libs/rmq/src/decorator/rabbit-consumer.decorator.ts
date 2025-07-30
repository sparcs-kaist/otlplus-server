// @otl/rmq/decorator/rabbit-consumer.decorator.ts
import 'reflect-metadata'

import type { QueueNames } from '../settings'

export const RABBIT_CONSUMER_METADATA = 'rabbit:consumer'

export interface RabbitConsumerOptions {
  /** 각 컨슈머가 채널에서 한 번에 가져올 메시지 수 (기본값: 10) */
  prefetch?: number
  timeout?: number
}

export interface RabbitConsumerMetadata {
  queueSymbol: QueueNames
  options: RabbitConsumerOptions
}

/**
 * RabbitMQ 큐의 메시지를 소비하는 메서드에 적용하는 데코레이터입니다.
 * @param queueSymbol settings.ts에 정의된 QueueNames enum 값
 * @param options 컨슈머 동작을 위한 추가 옵션
 */
export function RabbitConsumer(queueSymbol: QueueNames, options: RabbitConsumerOptions = {}): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    if (!descriptor || typeof descriptor.value !== 'function') {
      throw new Error('@RabbitConsumer must be applied to a method.')
    }

    const metadata: RabbitConsumerMetadata = {
      queueSymbol,
      options,
    }

    Reflect.defineMetadata(RABBIT_CONSUMER_METADATA, metadata, descriptor.value)
  }
}
