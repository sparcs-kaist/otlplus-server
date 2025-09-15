// main.ts
import { HttpException } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import settings from '@otl/server-consumer/settings'
import * as Sentry from '@sentry/nestjs'

import { HttpExceptionFilter, UnexpectedExceptionFilter } from '@otl/common/exception/exception.filter'

import { AppModule } from '../app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  // await appContext.startAllMicroservices()
  Sentry.init({
    dsn: settings().getSentryConfig().dsn as string,
    // Add Tracing by setting tracesSampleRate
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  })
  app.useGlobalFilters(new UnexpectedExceptionFilter(), new HttpExceptionFilter<HttpException>())
  console.log('start')
  await app.listen(3000)
}
bootstrap()
