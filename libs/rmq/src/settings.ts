import dotenv from 'dotenv'

import { dotEnvOptions } from './dotenv-options'

dotenv.config(dotEnvOptions)
console.log(`NODE_ENV environment: ${process.env.NODE_ENV}`)

export const QueueNames = {
  NOTI_INFO_FCM: 'NOTI_INFO_FCM',
  NOTI_AD_FCM: 'NOTI_AD_FCM',
  NOTI_NIGHT_AD_FCM: 'NOTI_NIGHT_AD_FCM',
  NOTI_EMAIL: 'NOTI_EMAIL',
} as const

export type QueueNames = (typeof QueueNames)[keyof typeof QueueNames]

const getRabbitMQConfig = () => ({
  url: process.env.RABBITMQ_URL,
  user: process.env.RABBITMQ_USER,
  password: process.env.RABBITMQ_PASSWORD,
  queueName: Object.values(QueueNames),
  exchangeConfig: {
    exchanges: [
      {
        name: 'notifications',
        type: 'topic',
      },
    ],
  },
  queueConfig: {
    NOTI_INFO_FCM: {
      exchange: 'notifications',
      routingKey: '*.info.fcm.*',
      queue: 'notifications.info.fcm.queue',
    },
    NOTI_AD_FCM: {
      exchange: 'notifications',
      routingKey: '*.ad.fcm.*',
      queue: 'notifications.ad.fcm.queue',
    },
    NOTI_NIGHT_AD_FCM: {
      exchange: 'notifications',
      routingKey: '*.night-ad.fcm.*',
      queue: 'notifications.night-ad.fcm.queue',
    },
    NOTI_EMAIL: {
      exchange: 'notifications',
      routingKey: '*.email.*',
      queue: 'notifications.email.queue',
    },
  },
})

export default () => ({
  getRabbitMQConfig: () => getRabbitMQConfig(),
})
