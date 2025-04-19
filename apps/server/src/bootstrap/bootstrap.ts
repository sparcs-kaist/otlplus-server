import { ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'
import csrf from 'csurf'
import { json } from 'express'
import session from 'express-session'
import fs from 'fs'
import morgan from 'morgan'
import * as v8 from 'node:v8'
import { join } from 'path'
import * as swaggerUi from 'swagger-ui-express'

import { AppModule } from '../app.module'
import settings from '../settings'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableVersioning({
    type: VersioningType.URI,
  })
  app.enableCors(settings().getCorsConfig())
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  app.use(
    session({
      secret: 'p@ssw0rd',
      resave: false,
      saveUninitialized: false,
    }),
  )
  app.use(cookieParser())
  app.use(
    '/',
    csrf({
      cookie: { key: 'csrftoken' },
      ignoreMethods: ['GET', 'HEAD', 'OPTIONS', 'DELETE', 'PATCH', 'PUT', 'POST'],
    }),
  )
  // Logs requests
  app.use(
    morgan(':method :url OS/:req[client-os] Ver/:req[client-api-version]', {
      // https://github.com/expressjs/morgan#immediate
      immediate: true,
      stream: {
        write: (message) => {
          console.info(message.trim())
        },
      },
    }),
  )

  // Logs responses
  // app.use(
  //   morgan(':method :url :status :res[content-length] :response-time ms', {
  //     stream: {
  //       write: (message) => {
  //         // console.log(formatMemoryUsage())
  //         console.info(message.trim());
  //       },
  //     },
  //   }),
  // );
  if (process.env.NODE_ENV !== 'prod') {
    const swaggerJsonPath = join(__dirname, '..', '..', 'docs', 'swagger.json')
    const swaggerDocument = JSON.parse(fs.readFileSync(swaggerJsonPath, 'utf-8'))
    app.use(
      '/api/docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, {
        swaggerOptions: {
          withCredentials: true,
        },
      }),
    )
  }

  app.use('/api/sync', json({ limit: '50mb' }))
  app.use(json({ limit: '100kb' }))
  console.log(v8.getHeapStatistics().heap_size_limit / 1024 / 1024)

  app.enableShutdownHooks()
  return app.listen(8000)
}

bootstrap()
  .then(() => console.log('Nest Ready'))
  .catch((error) => console.log(error))
