import { RabbitHandlerConfig, RabbitMQExchangeConfig } from '@golevelup/nestjs-rabbitmq/lib/rabbitmq.interfaces'
import dotenv from 'dotenv'

import { dotEnvOptions } from './dotenv-options'

dotenv.config(dotEnvOptions)
console.log(`NODE_ENV environment: ${process.env.NODE_ENV}`)

export const QueueNames = {
  NOTI_INFO_FCM: 'NOTI_INFO_FCM',
  NOTI_AD_FCM: 'NOTI_AD_FCM',
  NOTI_NIGHT_AD_FCM: 'NOTI_NIGHT_AD_FCM',
  NOTI_FCM: 'NOTI_FCM',
  NOTI_EMAIL: 'NOTI_EMAIL',
  NOTI_INFO_FCM_DLQ: 'NOTI_INFO_FCM_DLQ',
  NOTI_AD_FCM_DLQ: 'NOTI_AD_FCM_DLQ',
  NOTI_NIGHT_AD_FCM_DLQ: 'NOTI_NIGHT_AD_FCM_DLQ',
  NOTI_FCM_DLQ: 'NOTI_FCM_DLQ',
  NOTI_EMAIL_DLQ: 'NOTI_EMAIL_DLQ',
} as const

export type QueueNames = (typeof QueueNames)[keyof typeof QueueNames]
type rmqQueueConfig = Pick<
  RabbitHandlerConfig,
  | 'queue'
  | 'name'
  | 'deserializer'
  | 'connection'
  | 'exchange'
  | 'routingKey'
  | 'queueOptions'
  | 'errorBehavior'
  | 'errorHandler'
  | 'assertQueueErrorHandler'
  | 'createQueueIfNotExists'
  | 'allowNonJsonMessages'
  | 'usePersistentReplyTo'
  | 'batchOptions'
>
const getRabbitMQConfig = (): {
  url: string | undefined
  user: string | undefined
  password: string | undefined
  queueName: string[]
  exchangeConfig: {
    exchanges: RabbitMQExchangeConfig[]
  }
  queueConfig: Record<string, rmqQueueConfig>
} => ({
  url: process.env.RABBITMQ_URL,
  user: process.env.RABBITMQ_USER,
  password: process.env.RABBITMQ_PASSWORD,
  queueName: Object.values(QueueNames),
  exchangeConfig: {
    exchanges: [
      {
        name: 'notifications',
        type: 'x-delayed-message',
        createExchangeIfNotExists: true,
        options: {
          arguments: {
            'x-delayed-type': 'direct',
          },
        },
      },
      {
        name: 'notifications.dlx',
        type: 'x-delayed-message',
        createExchangeIfNotExists: true,
        options: {
          arguments: {
            'x-delayed-type': 'direct',
          },
        },
      },
    ],
  },
  queueConfig: {
    NOTI_FCM: {
      exchange: 'notifications',
      routingKey: 'notifications.fcm',
      queue: 'notifications.fcm.queue',
      createQueueIfNotExists: true,
      queueOptions: {
        deadLetterExchange: 'notifications.dlx',
      },
    },
    NOTI_INFO_FCM: {
      exchange: 'notifications',
      routingKey: 'notifications.info.fcm',
      queue: 'notifications.info.fcm.queue',
      createQueueIfNotExists: true,
      queueOptions: {
        deadLetterExchange: 'notifications.dlx',
      },
    },
    NOTI_AD_FCM: {
      exchange: 'notifications',
      routingKey: 'notifications.ad.fcm',
      queue: 'notifications.ad.fcm.queue',
      createQueueIfNotExists: true,
      queueOptions: {
        deadLetterExchange: 'notifications.dlx',
      },
    },
    NOTI_NIGHT_AD_FCM: {
      exchange: 'notifications',
      routingKey: 'notifications.night-ad.fcm',
      queue: 'notifications.night-ad.fcm.queue',
      createQueueIfNotExists: true,
      queueOptions: {
        deadLetterExchange: 'notifications.dlx',
      },
    },
    NOTI_EMAIL: {
      exchange: 'notifications',
      routingKey: 'notifications.email',
      queue: 'notifications.email.queue',
      createQueueIfNotExists: true,
      queueOptions: {
        deadLetterExchange: 'notifications.dlx',
      },
    },
    NOTI_FCM_DLQ: {
      exchange: 'notifications.dlx',
      routingKey: 'notifications.fcm',
      queue: 'notifications.fcm.dlq',
      createQueueIfNotExists: true,
    },
    NOTI_INFO_FCM_DLQ: {
      exchange: 'notifications.dlx',
      routingKey: 'notifications.info.fcm',
      queue: 'notifications.info.fcm.dlq',
      createQueueIfNotExists: true,
    },
    NOTI_AD_FCM_DLQ: {
      exchange: 'notifications.dlx',
      routingKey: 'notifications.ad.fcm',
      queue: 'notifications.ad.fcm.dlq',
      createQueueIfNotExists: true,
    },
    NOTI_NIGHT_AD_FCM_DLQ: {
      exchange: 'notifications.dlx',
      routingKey: 'notifications.night-ad.fcm',
      queue: 'notifications.night-ad.fcm.dlq',
      createQueueIfNotExists: true,
      queueOptions: {
        deadLetterExchange: 'notifications.dlx',
      },
    },
    NOTI_EMAIL_DLQ: {
      exchange: 'notifications',
      routingKey: 'notifications.email',
      queue: 'notifications.email.queue',
      createQueueIfNotExists: true,
      queueOptions: {
        deadLetterExchange: 'notifications.dlx',
      },
    },
  },
})

export default () => ({
  getRabbitMQConfig: () => getRabbitMQConfig(),
})
