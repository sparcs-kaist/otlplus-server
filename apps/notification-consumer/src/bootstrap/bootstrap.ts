// main.ts
import { NestFactory } from '@nestjs/core'
import settings from '@otl/notification-consumer/settings'
import * as admin from 'firebase-admin'
import { ServiceAccount } from 'firebase-admin'

import { AppModule } from '../app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  // await appContext.startAllMicroservices()
  console.log('start')
  const serviceAccount: ServiceAccount = settings().getFirebaseConfig()

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
  await app.listen(3000)
}
bootstrap()
