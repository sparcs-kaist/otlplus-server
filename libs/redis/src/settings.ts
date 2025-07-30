import dotenv from 'dotenv'

import { dotEnvOptions } from './dotenv-options'

dotenv.config(dotEnvOptions)
console.log(`NODE_ENV environment: ${process.env.NODE_ENV}`)

const getRedisConfig = () => {
  const redisConfig = {
    host: process.env.REDIS_SCHEDULER_HOST || 'localhost',
    port: parseInt(process.env.REDIS_SCHEDULER_PORT || '6379'),
    password: process.env.REDIS_SCHEDULER_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0'),
  }

  return redisConfig
}

export default () => ({
  getRedisConfig: () => getRedisConfig(),
})
