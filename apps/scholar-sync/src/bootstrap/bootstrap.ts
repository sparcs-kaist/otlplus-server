import { ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import csrf from 'csurf'
import { json } from 'express'
import session from 'express-session'
import morgan from 'morgan'

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
  app.use(
    morgan(':method :url :status :res[content-length] :response-time ms', {
      stream: {
        write: (message) => {
          // console.log(formatMemoryUsage())
          console.info(message.trim())
        },
      },
    }),
  )

  const document = SwaggerModule.createDocument(app, settings().getSwaggerConfig())
  SwaggerModule.setup('api/docs', app, document)
  app.use('/api/sync', json({ limit: '50mb' }))
  app.use(json({ limit: '100kb' }))

  app.enableShutdownHooks()
  return app.listen(9000)
}

bootstrap()
  .then(() => console.log('Nest Ready'))
  .catch((error) => console.log(error))
