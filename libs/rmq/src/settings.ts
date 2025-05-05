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
  queueConfig: [
    {
      name: QueueNames.NOTI_INFO_FCM,
      urls: [process.env.RABBITMQ_URL as string],
      exchange: 'notifications',
      exchangeType: 'topic',
      queue: 'notifications.info.fcm.queue',
      routingKey: '*.info.fcm.*',
      queueOptions: { durable: true },
      persistent: true,
      noAck: false,
      wildcards: true,
    },
    {
      name: QueueNames.NOTI_AD_FCM,
      urls: [process.env.RABBITMQ_URL as string],
      exchange: 'notifications',
      exchangeType: 'topic',
      queue: 'notifications.ad.fcm.queue',
      routingKey: '*.ad.fcm.*',
      queueOptions: { durable: true },
      persistent: true,
      noAck: false,
      wildcards: true,
    },
    {
      name: QueueNames.NOTI_NIGHT_AD_FCM,
      urls: [process.env.RABBITMQ_URL as string],
      exchange: 'notifications',
      exchangeType: 'topic',
      queue: 'notifications.night-ad.fcm.queue',
      routingKey: '*.night-ad.fcm.*',
      queueOptions: { durable: true },
      persistent: true,
      noAck: false,
      wildcards: true,
    },
    {
      name: QueueNames.NOTI_EMAIL,
      urls: [process.env.RABBITMQ_URL as string],
      exchange: 'notifications',
      exchangeType: 'topic',
      queue: 'notifications.email.queue',
      routingKey: '*.email.*',
      queueOptions: { durable: true },
      persistent: true,
      noAck: false,
      wildcards: true,
    },
  ],
})

export default () => ({
  getRabbitMQConfig: () => getRabbitMQConfig(),
})
