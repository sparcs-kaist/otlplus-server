import { DocumentBuilder } from '@nestjs/swagger'
import dotenv from 'dotenv'
import * as mariadb from 'mariadb'

import { dotEnvOptions } from './dotenv-options'

dotenv.config(dotEnvOptions)
console.log(`NODE_ENV environment: ${process.env.NODE_ENV}`)

const getCorsConfig = () => {
  const { NODE_ENV } = process.env
  if (NODE_ENV === 'prod') {
    return {
      origin: [
        'https://otl.kaist.ac.kr',
        'http://otl.kaist.ac.kr',
        'https://otl.sparcs.org',
        'http://otl.sparcs.org',
        'https://beta.otl.sparcs.org',
        'https://beta.otl.sparcs.org',
      ],
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

const getPrismaConnectConfig = (): mariadb.PoolConfig => ({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT) || 3306,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 10,
})

const getRedisConfig = () => ({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
})

const getAWSConfig = () => ({})

const getJwtConfig = () => ({
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: process.env.EXPIRES_IN,
    refreshExpiresIn: process.env.REFRESH_EXPIRES_IN,
  },
  oneAppSecret: process.env.ONEAPP_JWT_SECRET,
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

export default () => ({
  ormconfig: () => getPrismaConnectConfig(),
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
})
