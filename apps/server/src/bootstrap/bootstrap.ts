import { HttpException, ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'
import csrf from 'csurf'
import { json } from 'express'
import session from 'express-session'
import fs from 'fs'
import * as v8 from 'node:v8'
import { join } from 'path'
import * as swaggerUi from 'swagger-ui-express'

import { HttpExceptionFilter, UnexpectedExceptionFilter } from '@otl/common/exception/exception.filter'

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
  app.useGlobalFilters(new UnexpectedExceptionFilter(), new HttpExceptionFilter<HttpException>())
  console.log(v8.getHeapStatistics().heap_size_limit / 1024 / 1024)

  app.enableShutdownHooks()
  return app.listen(8000)
}

bootstrap()
  .then(() => console.log('Nest Ready'))
  .catch((error) => console.log(error))
