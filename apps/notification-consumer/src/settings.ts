// import { Prisma } from '@prisma/client'
// import dotenv from 'dotenv'
//
// import { dotEnvOptions } from './dotenv-options'
//
// dotenv.config(dotEnvOptions)
// console.log(`NODE_ENV environment: ${process.env.NODE_ENV}`)
//
// const getPrismaConfig = (): Prisma.PrismaClientOptions => ({
//   datasources: {
//     db: {
//       url: process.env.DATABASE_URL,
//     },
//   },
//   errorFormat: 'pretty',
//   log: [
//     // {
//     //   emit: 'event',
//     //   level: 'query',
//     // },
//     {
//       emit: 'stdout',
//       level: 'error',
//     },
//     {
//       emit: 'stdout',
//       level: 'info',
//     },
//     // {
//     //   emit: 'stdout',
//     //   level: 'warn',
//     // },
//   ],
// })
//
// const getVersion = () => String(process.env.npm_package_version)
//
// const getRabbitMQConfig = (): any => ({
//   url: process.env.RABBITMQ_URL,
//   user: process.env.RABBITMQ_USER,
//   password: process.env.RABBITMQ_PASSWORD,
// })
//
// export default () => ({
//   ormconfig: () => getPrismaConfig(),
//   getVersion: () => getVersion(),
//   getRabbitMQConfig: () => getRabbitMQConfig(),
// })
