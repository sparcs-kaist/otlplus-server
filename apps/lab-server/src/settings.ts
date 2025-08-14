import { DocumentBuilder } from '@nestjs/swagger'
import { WeaviateModuleConfig } from '@otl/lab-server/common/interfaces/IWeaviate'
import dotenv from 'dotenv'
import * as mariadb from 'mariadb'

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

const getPrismaConnectConfig = (): mariadb.PoolConfig => ({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT) || 3306,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 10,
})

const getPrismaReadConnectConfig = (): mariadb.PoolConfig => ({
  host: process.env.READ_DATABASE_HOST,
  port: Number(process.env.READ_DATABASE_PORT) || 3306,
  user: process.env.READ_DATABASE_USER,
  password: process.env.READ_DATABASE_PASSWORD,
  database: process.env.READ_DATABASE_NAME,
  connectionLimit: 10,
})

const getVersion = () => String(process.env.npm_package_version)

const getSwaggerConfig = () => {
  const config = new DocumentBuilder()
    .setTitle('OTLPlus-Lab')
    .setDescription('OTLPLus Lab Server Description')
    .setVersion('1.0')
    .build()
  return config
}

const getSwaggerStatsConfig = () => ({
  username: process.env.SWAGGER_STATS_USERNAME,
  password: process.env.SWAGGER_STAT_PASSWORD,
})

const getWeaviateConfig = (): WeaviateModuleConfig => ({
  weaviateConfig: {
    httpHost: process.env.WEAVIATE_HTTP_HOST!,
    httpPort: Number(process.env.WEAVIATE_HTTP_PORT || 443),
    httpSecure: false,
    grpcHost: process.env.WEAVIATE_GRPC_HOST!,
    grpcPort: Number(process.env.WEAVIATE_GRPC_PORT || 443),
    grpcSecure: false,
    skipInitChecks: true,
  },
  geminiConfig: process.env.GEMINI_KEY || 'geminikey',
})

export default () => ({
  ormConfig: () => getPrismaConnectConfig(),
  ormReplicatedConfig: () => getPrismaReadConnectConfig(),
  getCorsConfig: () => getCorsConfig(),
  getVersion: () => getVersion(),
  getSwaggerConfig: () => getSwaggerConfig(),
  getSwaggerStatsConfig: () => getSwaggerStatsConfig(),
  weaviateConfig: () => getWeaviateConfig(),
})
