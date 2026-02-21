// Sentry instrumentation MUST be imported before everything else
import './instrument'

import { NestFactory } from '@nestjs/core'
import settings from '@otl/notification-consumer/settings'
import * as admin from 'firebase-admin'
import { ServiceAccount } from 'firebase-admin'

import { AppModule } from '../app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  console.log('start')
  const serviceAccount: ServiceAccount = settings().getFirebaseConfig()

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
  await app.listen(3000)
}
bootstrap()
