import { RabbitHandlerConfig, RabbitMQExchangeConfig } from '@golevelup/nestjs-rabbitmq/lib/rabbitmq.interfaces'
import dotenv from 'dotenv'

import { dotEnvOptions } from './dotenv-options'

dotenv.config(dotEnvOptions)
console.log(`NODE_ENV environment: ${process.env.NODE_ENV}`)

export const ExchangeNames = {
  NOTIFICATIONS: 'notifications',
  NOTIFICATIONS_DLX: 'notifications.dlx',
  SCHOLAR_SYNC: 'scholar-sync',
  SCHOLAR_SYNC_DLX: 'scholar-sync.dlx',
  STATISTICS: 'statistics',
  STATISTICS_DLX: 'statistics.dlx',
}

export const QueueNames = {
  NOTI_INFO_FCM: 'notifications.info.fcm.queue',
  NOTI_AD_FCM: 'notifications.ad.fcm.queue',
  NOTI_NIGHT_AD_FCM: 'notifications.night-ad.fcm.queue',
  NOTI_FCM: 'notifications.fcm.queue',
  NOTI_EMAIL: 'notifications.email.queue',
  NOTI_INFO_FCM_DLQ: 'notifications.info.fcm.dlq',
  NOTI_AD_FCM_DLQ: 'notifications.ad.fcm.dlq',
  NOTI_NIGHT_AD_FCM_DLQ: 'notifications.night-ad.fcm.dlq',
  NOTI_FCM_DLQ: 'notifications.fcm.dlq',
  NOTI_EMAIL_DLQ: 'notifications.email.dlq',
  SCHOLAR_SYNC: 'scholar-sync.queue',
  SCHOLAR_SYNC_DLQ: 'scholar-sync.dlq',
  STATISTICS: 'statistics.queue',
  STATISTICS_DLQ: 'statistics.dlq',
}

export const QueueSymbols = {
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
  SCHOLAR_SYNC: 'SCHOLAR_SYNC',
  SCHOLAR_SYNC_DLQ: 'SCHOLAR_SYNC_DLQ',
  STATISTICS: 'STATISTICS',
  STATISTICS_DLQ: 'STATISTICS_DLQ',
} as const

export type QueueNames = (typeof QueueSymbols)[keyof typeof QueueSymbols]
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
    exchangeMap: Record<string, RabbitMQExchangeConfig>
  }
  queueConfig: Record<string, rmqQueueConfig>
} => {
  const exchangeMap: Record<string, RabbitMQExchangeConfig> = {
    [ExchangeNames.NOTIFICATIONS]: {
      name: ExchangeNames.NOTIFICATIONS,
      type: 'x-delayed-message',
      createExchangeIfNotExists: true,
      options: {
        arguments: {
          'x-delayed-type': 'direct',
        },
      },
    },
    [ExchangeNames.NOTIFICATIONS_DLX]: {
      name: ExchangeNames.NOTIFICATIONS_DLX,
      type: 'x-delayed-message',
      createExchangeIfNotExists: true,
      options: {
        arguments: {
          'x-delayed-type': 'direct',
        },
      },
    },
    [ExchangeNames.SCHOLAR_SYNC]: {
      name: ExchangeNames.SCHOLAR_SYNC,
      type: 'x-delayed-message',
      createExchangeIfNotExists: true,
      options: {
        arguments: {
          'x-delayed-type': 'direct',
        },
      },
    },
    [ExchangeNames.SCHOLAR_SYNC_DLX]: {
      name: ExchangeNames.SCHOLAR_SYNC_DLX,
      type: 'x-delayed-message',
      createExchangeIfNotExists: true,
      options: {
        arguments: {
          'x-delayed-type': 'direct',
        },
      },
    },
    [ExchangeNames.STATISTICS]: {
      name: ExchangeNames.STATISTICS,
      type: 'x-delayed-message',
      createExchangeIfNotExists: true,
      options: {
        arguments: {
          'x-delayed-type': 'direct',
        },
      },
    },
    [ExchangeNames.STATISTICS_DLX]: {
      name: ExchangeNames.STATISTICS_DLX,
      type: 'x-delayed-message',
      createExchangeIfNotExists: true,
      options: {
        arguments: {
          'x-delayed-type': 'direct',
        },
      },
    },
  }
  return {
    url: process.env.RABBITMQ_URL,
    user: process.env.RABBITMQ_USER,
    password: process.env.RABBITMQ_PASSWORD,
    queueName: Object.values(QueueSymbols),
    exchangeConfig: {
      exchanges: [
        exchangeMap[ExchangeNames.NOTIFICATIONS],
        exchangeMap[ExchangeNames.NOTIFICATIONS_DLX],
        exchangeMap[ExchangeNames.SCHOLAR_SYNC],
        exchangeMap[ExchangeNames.SCHOLAR_SYNC_DLX],
        exchangeMap[ExchangeNames.STATISTICS],
        exchangeMap[ExchangeNames.STATISTICS_DLX],
      ],
      exchangeMap,
    },
    queueConfig: {
      NOTI_FCM: {
        exchange: ExchangeNames.NOTIFICATIONS,
        routingKey: 'notifications.fcm',
        queue: QueueNames.NOTI_FCM,
        createQueueIfNotExists: true,
        queueOptions: {
          deadLetterExchange: ExchangeNames.NOTIFICATIONS_DLX,
        },
      },
      NOTI_INFO_FCM: {
        exchange: ExchangeNames.NOTIFICATIONS,
        routingKey: 'notifications.info.fcm',
        queue: QueueNames.NOTI_INFO_FCM,
        createQueueIfNotExists: true,
        queueOptions: {
          deadLetterExchange: ExchangeNames.NOTIFICATIONS_DLX,
        },
      },
      NOTI_AD_FCM: {
        exchange: ExchangeNames.NOTIFICATIONS,
        routingKey: 'notifications.ad.fcm',
        queue: QueueNames.NOTI_AD_FCM,
        createQueueIfNotExists: true,
        queueOptions: {
          deadLetterExchange: ExchangeNames.NOTIFICATIONS_DLX,
        },
      },
      NOTI_NIGHT_AD_FCM: {
        exchange: ExchangeNames.NOTIFICATIONS,
        routingKey: 'notifications.night-ad.fcm',
        queue: QueueNames.NOTI_NIGHT_AD_FCM,
        createQueueIfNotExists: true,
        queueOptions: {
          deadLetterExchange: ExchangeNames.NOTIFICATIONS_DLX,
        },
      },
      NOTI_FCM_DLQ: {
        exchange: ExchangeNames.NOTIFICATIONS_DLX,
        routingKey: 'notifications.fcm',
        queue: QueueNames.NOTI_FCM_DLQ,
        createQueueIfNotExists: true,
      },
      NOTI_INFO_FCM_DLQ: {
        exchange: ExchangeNames.NOTIFICATIONS_DLX,
        routingKey: 'notifications.info.fcm',
        queue: QueueNames.NOTI_INFO_FCM_DLQ,
        createQueueIfNotExists: true,
      },
      NOTI_AD_FCM_DLQ: {
        exchange: ExchangeNames.NOTIFICATIONS_DLX,
        routingKey: 'notifications.ad.fcm',
        queue: QueueNames.NOTI_AD_FCM_DLQ,
        createQueueIfNotExists: true,
      },
      NOTI_NIGHT_AD_FCM_DLQ: {
        exchange: ExchangeNames.NOTIFICATIONS_DLX,
        routingKey: 'notifications.night-ad.fcm',
        queue: QueueNames.NOTI_NIGHT_AD_FCM_DLQ,
        createQueueIfNotExists: true,
      },
      SCHOLAR_SYNC: {
        exchange: ExchangeNames.SCHOLAR_SYNC,
        routingKey: 'scholar-sync',
        queue: QueueNames.SCHOLAR_SYNC,
        createQueueIfNotExists: true,
        queueOptions: {
          deadLetterExchange: ExchangeNames.SCHOLAR_SYNC_DLX,
        },
      },
      SCHOLAR_SYNC_DLQ: {
        exchange: ExchangeNames.SCHOLAR_SYNC_DLX,
        routingKey: 'scholar-sync',
        queue: QueueNames.SCHOLAR_SYNC_DLQ,
        createQueueIfNotExists: true,
      },
      STATISTICS: {
        exchange: ExchangeNames.STATISTICS,
        routingKey: 'statistics',
        queue: QueueNames.STATISTICS,
        createQueueIfNotExists: true,
      },
      STATISTICS_DLQ: {
        exchange: ExchangeNames.STATISTICS_DLX,
        routingKey: 'statistics',
        queue: QueueNames.STATISTICS_DLQ,
        createQueueIfNotExists: true,
      },
    },
  }
}

export default () => ({
  getRabbitMQConfig: () => getRabbitMQConfig(),
})
