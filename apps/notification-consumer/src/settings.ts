import { RedisModuleOptions } from '@nestjs-modules/ioredis'
import dotenv from 'dotenv'
import { ServiceAccount } from 'firebase-admin'
import * as fs from 'fs'
import path from 'path'

import { buildPostgresDatasourceUrl, PrismaConnectionOptions } from '@otl/prisma-client/prisma.config'

import { dotEnvOptions } from './dotenv-options'

dotenv.config(dotEnvOptions)
console.log(`NODE_ENV environment: ${process.env.NODE_ENV}`)

const getPrismaConnectConfig = (): PrismaConnectionOptions => ({
  datasourceUrl: buildPostgresDatasourceUrl({
    datasourceUrl: process.env.DATABASE_URL,
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT) || 5432,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 20,
  }),
})

const getFirebaseConfig = (): ServiceAccount => {
  const secretPath = process.env.GOOGLE_APPLICATION_CREDENTIALS as string
  const credentialPath = path.resolve(process.cwd(), secretPath)
  const file = fs.readFileSync(credentialPath, 'utf-8')
  const serviceAccount = JSON.parse(file)

  return {
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key,
  }
}

const getVersion = () => String(process.env.npm_package_version)

const getRedisConfig = (): RedisModuleOptions => ({
  type: 'single',
  url: process.env.REDIS_SCHEDULER_URL,
  options: {
    password: process.env.REDIS_PASSWORD,
  },
})

export default () => ({
  ormconfig: () => getPrismaConnectConfig(),
  getVersion: () => getVersion(),
  getFirebaseConfig: () => getFirebaseConfig(),
  getRedisConfig: () => getRedisConfig(),
})
