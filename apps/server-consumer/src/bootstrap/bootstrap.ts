// main.ts
import { NestFactory } from '@nestjs/core'

import { AppModule } from '../app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  // await appContext.startAllMicroservices()
  console.log('start')
  await app.listen(3000)
}
bootstrap()
