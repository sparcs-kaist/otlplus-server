import { ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'
import csrf from 'csurf'
import session from 'express-session'
import fs from 'fs'
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
  const swaggerJsonPath = join(__dirname, '..', '..', 'docs', 'swagger.json')
  const swaggerDocument = JSON.parse(fs.readFileSync(swaggerJsonPath, 'utf-8'))
  if (process.env.NODE_ENV !== 'prod') {
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

  app.enableShutdownHooks()
  return app.listen(8002)
}

bootstrap()
  .then(() => console.log('Nest Ready'))
  .catch((error) => console.log(error))
