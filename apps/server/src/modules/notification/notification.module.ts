import { Module } from '@nestjs/common'
import { ClientsModule, RmqOptions, Transport } from '@nestjs/microservices'
import { NOTIFICATION_IN_PORT } from '@otl/server-nest/modules/notification/domain/notification.in.public.port'
import { NOTIFICATION_REPOSITORY } from '@otl/server-nest/modules/notification/domain/notification.repository'
import { NotificationService } from '@otl/server-nest/modules/notification/notification.service'
import settings from '@otl/server-nest/settings'

import { NotificationType } from '@otl/common/enum/notification'

import { PrismaModule } from '@otl/prisma-client'
import { NotificationPrismaRepository } from '@otl/prisma-client/repositories/notification.repository'

export const queueList = Object.values(NotificationType)
const queueModuleFactory = () => queueList.map(
  (queueName) => ({
    name: Symbol(queueName),
    transport: Transport.RMQ,
    options: {
      urls: [settings().getRabbitMQConfig().url],
      queue: queueName,
    },
  }) as RmqOptions & { name: string | symbol },
)

@Module({
  imports: [PrismaModule, ClientsModule.register(queueModuleFactory())],
  providers: [
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: NotificationPrismaRepository,
    },
    {
      provide: NOTIFICATION_IN_PORT,
      useFactory: (notificationRepository) => new NotificationService(notificationRepository),
    },
  ],
  exports: [NOTIFICATION_IN_PORT],
})
export class NotificationModule {}
