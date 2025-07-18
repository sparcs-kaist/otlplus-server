import { RedisModuleOptions } from '@nestjs-modules/ioredis'
import { Prisma } from '@prisma/client'
import dotenv from 'dotenv'
import { ServiceAccount } from 'firebase-admin'
import * as fs from 'fs'
import path from 'path'

import { dotEnvOptions } from './dotenv-options'

dotenv.config(dotEnvOptions)
console.log(`NODE_ENV environment: ${process.env.NODE_ENV}`)

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
  ormconfig: () => getPrismaConfig(),
  getVersion: () => getVersion(),
  getFirebaseConfig: () => getFirebaseConfig(),
  getRedisConfig: () => getRedisConfig(),
})
