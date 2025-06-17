import { HttpException, ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as Sentry from '@sentry/nestjs'
import cookieParser from 'cookie-parser'
import csrf from 'csurf'
import { json } from 'express'
import session from 'express-session'
import fs from 'fs'
import { join } from 'path'
import swaggerStats from 'swagger-stats'
import * as swaggerUi from 'swagger-ui-express'

import { AgreementType } from '@otl/common/enum/agreement'
import { HttpExceptionFilter, UnexpectedExceptionFilter } from '@otl/common/exception/exception.filter'

import { PrismaService } from '@otl/prisma-client'

import { AppModule } from '../app.module'
import settings from '../settings'

function initializeDB(prismaService: PrismaService) {
  const agreementTypes = Object.values(AgreementType)
  Promise.all(
    agreementTypes.map(async (type) => {
      await prismaService.agreement.upsert({
        where: { name: type },
        update: {},
        create: {
          name: type,
        },
      })
    }),
  )
    .then(() => {
      console.log('DB initialized')
    })
    .catch((error) => {
      console.error('Error initializing DB:', error)
    })
}

async function bootstrap() {
  Sentry.init({
    dsn: settings().getSentryConfig().dsn as string,
    // Add Tracing by setting tracesSampleRate
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  })

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
  app.use(
    swaggerStats.getMiddleware({
      swaggerSpec: swaggerDocument,
      uriPath: '/swagger-stats',
      authentication: true,
      onAuthenticate(_req, username, password) {
        // simple check for username and password
        const swaggerStatsConfig = settings().getSwaggerStatsConfig()
        return username === swaggerStatsConfig.username && password === swaggerStatsConfig.password
      },
    }),
  )

  app.use('/api/sync', json({ limit: '50mb' }))
  app.use(json({ limit: '100kb' }))
  app.useGlobalFilters(new UnexpectedExceptionFilter(), new HttpExceptionFilter<HttpException>())
  initializeDB(app.get(PrismaService))
  app.enableShutdownHooks()
  return app.listen(8000)
}

bootstrap()
  .then(() => console.log('Nest Ready'))
  .catch((error) => console.log(error))
