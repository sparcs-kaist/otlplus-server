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

export default () => ({
  ormconfig: () => getPrismaConnectConfig(),
  ormReplicatedConfig: () => getPrismaReadConnectConfig(),
  getVersion: () => getVersion(),
})
