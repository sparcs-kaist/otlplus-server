import { RabbitHandlerConfig, RabbitMQExchangeConfig } from '@golevelup/nestjs-rabbitmq/lib/rabbitmq.interfaces'
import { DocumentBuilder } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import dotenv from 'dotenv'

import { dotEnvOptions } from './dotenv-options'

dotenv.config(dotEnvOptions)
console.log(`NODE_ENV environment: ${process.env.NODE_ENV}`)

const getCorsConfig = () => {
  const { NODE_ENV } = process.env
  if (NODE_ENV === 'prod') {
    return {
      origin: ['https://otl.kaist.ac.kr', 'http://otl.kaist.ac.kr', 'https://otl.sparcs.org', 'http://otl.sparcs.org'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    }
  }
  if (NODE_ENV === 'dev') {
    return {
      origin: ['https://otl.dev.sparcs.org', 'http://localhost:5173'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    }
  }
  return {
    origin: ['http://localhost:5173', 'http://localhost:8000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }
}

const getPrismaConfig = (): Prisma.PrismaClientOptions => ({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  errorFormat: 'pretty',
  log: [
    // {
    //   emit: 'event',
    //   level: 'query',
    // },
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'info',
    },
    // {
    //   emit: 'stdout',
    //   level: 'warn',
    // },
  ],
})

const getRedisConfig = () => ({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
})

const getReplicatedPrismaConfig = (): Prisma.PrismaClientOptions => ({})

const getAWSConfig = () => ({})

const getJwtConfig = () => ({
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: process.env.EXPIRES_IN,
    refreshExpiresIn: process.env.REFRESH_EXPIRES_IN,
  },
})

const getSsoConfig = (): any => ({
  ssoIsBeta: process.env.SSO_IS_BETA !== 'false',
  ssoClientId: process.env.SSO_CLIENT_ID,
  ssoSecretKey: process.env.SSO_SECRET_KEY,
})

const getSyncConfig = () => ({
  apiKey: process.env.SYNC_SECRET,
  slackKey: process.env.SLACK_KEY,
})

const getVersion = () => String(process.env.npm_package_version)

const getSwaggerConfig = () => {
  const config = new DocumentBuilder()
    .setTitle('OTLPlus-server')
    .setDescription('The OTL-server API description')
    .setVersion('1.0')
    .build()
  return config
}

const getSwaggerStatsConfig = () => ({
  username: process.env.SWAGGER_STATS_USERNAME,
  password: process.env.SWAGGER_STAT_PASSWORD,
})

const staticConfig = (): any => ({
  file_path:
    process.env.DOCKER_DEPLOY === 'true' ? '/var/www/otlplus-server/apps/server/static/' : 'apps/server/static/',
})

const sentryConfig = () => ({
  dsn: process.env.SENTRY_DSN,
})

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
  ormconfig: () => getPrismaConfig(),
  ormReplicatedConfig: () => getReplicatedPrismaConfig(),
  awsconfig: () => getAWSConfig(),
  getRedisConfig: () => getRedisConfig(),
  getJwtConfig: () => getJwtConfig(),
  getSsoConfig: () => getSsoConfig(),
  getCorsConfig: () => getCorsConfig(),
  syncConfig: () => getSyncConfig(),
  getVersion: () => getVersion(),
  getStaticConfig: () => staticConfig(),
  getSwaggerConfig: () => getSwaggerConfig(),
  getSwaggerStatsConfig: () => getSwaggerStatsConfig(),
  getSentryConfig: () => sentryConfig(),
  getRabbitMQConfig: () => getRabbitMQConfig(),
})
