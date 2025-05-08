// main.ts
import { NestFactory } from '@nestjs/core'

import { AppModule } from '../app.module'

async function bootstrap() {
  const appContext = await NestFactory.create(AppModule)
  // await appContext.startAllMicroservices()
  console.log('start')
  await appContext.listen(3000)
}
bootstrap()
