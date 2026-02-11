import dotenv from 'dotenv'
import * as mariadb from 'mariadb'

import { dotEnvOptions } from './dotenv-options'

dotenv.config(dotEnvOptions)
console.log(`NODE_ENV environment: ${process.env.NODE_ENV}`)

const getPrismaConnectConfig = (): mariadb.PoolConfig => ({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT) || 3306,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
})

const sentryConfig = () => ({
  dsn: process.env.SENTRY_DSN_SERVER_CONSUMER,
})

const getVersion = () => String(process.env.npm_package_version)

export default () => ({
  ormconfig: () => getPrismaConnectConfig(),
  getVersion: () => getVersion(),
  getSentryConfig: () => sentryConfig(),
})
