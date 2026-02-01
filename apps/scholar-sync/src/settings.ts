import { DocumentBuilder } from '@nestjs/swagger'
import dotenv from 'dotenv'
import * as mariadb from 'mariadb'
import { utilities } from 'nest-winston'
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

import { dotEnvOptions } from './dotenv-options'

dotenv.config(dotEnvOptions)
console.log(`NODE_ENV environment: ${process.env.NODE_ENV}`)

const getCorsConfig = () => {
  const { NODE_ENV } = process.env
  if (NODE_ENV === 'prod') {
    return {
      origin: ['https://otl-sync.sparcs.org', 'http://otl-sync.sparcs.org'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    }
  }
  if (NODE_ENV === 'dev') {
    return {
      origin: ['https://otl-sync.dev.sparcs.org', 'http://localhost:9000'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    }
  }
  return {
    origin: 'http://localhost:9000',
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

const getSyncConfig = () => ({
  slackKey: process.env.SLACK_KEY,
  scholarKey: process.env.SCHOLAR_AUTH_KEY,
  scholarUrl: process.env.SCHOLAR_BASE_URL,
})

const getVersion = () => String(process.env.npm_package_version)

const getSwaggerConfig = () => {
  const config = new DocumentBuilder()
    .setTitle('OTLPlus-Scholar-Sync')
    .setDescription('The OTL Scholar Sync API description')
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-KEY',
        in: 'header',
        description: 'KAIST SCHOLAR API KEY',
      },
      'X-API-KEY',
    )
    // .addSecurity('x-api-key', {
    //   type: 'apiKey',
    //   in: 'header',
    //   scheme: 'https',
    //   description: 'KAIST SCHOLAR API KEY',
    // })
    .build()
  return config
}

function getLoggingConfig() {
  const logDir = `${__dirname}/../../logs` // log 파일을 관리할 폴더
  const { NODE_ENV } = process.env
  const dailyOptions = (level: string) => ({
    level,
    datePattern: 'YYYY-MM-DD',
    dirname: `${logDir}/${NODE_ENV}`,
    filename: `%DATE%.${level}.log`,
    maxFiles: 30, // 30일치 로그파일 저장
    zippedArchive: true, // 로그가 쌓이면 압축하여 관리
  })
  return {
    logDir,
    transports: [
      new winston.transports.Console({
        level: NODE_ENV === 'prod' ? 'http' : 'silly',
        format:
          NODE_ENV === 'prod'
            ? winston.format.simple()
            : winston.format.combine(
              winston.format.timestamp(),
              utilities.format.nestLike('@otl/scholar-sync', { prettyPrint: true }),
            ),
      }),
      // info, warn, error 로그는 파일로 관리
      new DailyRotateFile(dailyOptions('info')),
      new DailyRotateFile(dailyOptions('warn')),
      new DailyRotateFile(dailyOptions('error')),
    ],
  }
}
export default () => ({
  ormconfig: () => getPrismaConnectConfig(),
  getCorsConfig: () => getCorsConfig(),
  syncConfig: () => getSyncConfig(),
  getVersion: () => getVersion(),
  getSwaggerConfig: () => getSwaggerConfig(),
  loggingConfig: () => getLoggingConfig(),
})
