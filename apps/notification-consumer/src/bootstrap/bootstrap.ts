// main.ts
import { NestFactory } from '@nestjs/core'
import { queueModuleFactory } from '@otl/rmq/rmq.module'

import { AppModule } from '../app.module'

async function bootstrap() {
  const appContext = await NestFactory.create(AppModule)

  // const queueList = Object.values(NotificationType)
  // const queueModuleFactory = () => queueList.map((queueName) => ({
  //   transport: Transport.RMQ,
  //   options: {
  //     urls: [settings().getRabbitMQConfig().url],
  //     queue: queueName,
  //     queueOptions: {
  //       durable: true,
  //     },
  //   },
  // }))

  await Promise.all(
    queueModuleFactory().map(async (q) => {
      console.log(q)
      await appContext.connectMicroservice(q)
    }),
  )
  await appContext.startAllMicroservices()
  console.log('start')
}
bootstrap()
