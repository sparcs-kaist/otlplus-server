import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import settings from '@otl/scholar-sync/settings'

import { AppModule } from '../app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )

  app.enableCors(settings().getCorsConfig())
  app.enableShutdownHooks()

  await app.listen(9009)
  console.log('otlplus-nest lab-server now listening on localhost:9009')
}

bootstrap().catch((err) => {
  console.error('otlplus-nest lab-server failed to boot', err)
})
