import { DocumentBuilder } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { PrismaClient as PrismaClient$1 } from '@prisma/client/extension'
import dotenv from 'dotenv'

import { dotEnvOptions } from './dotenv-options'

dotenv.config(dotEnvOptions)
console.log(`NODE_ENV environment: ${process.env.NODE_ENV}`)

type ReplicasOptions =
  | {
    url: string | string[]
    replicas?: undefined
  }
  | {
    url?: undefined
    replicas: PrismaClient$1[]
  }

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

const getReplicatedPrismaConfig = (): ReplicasOptions => ({
  url: process.env.READ_ONLY_DATABASE_URL as string,
})

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
})
