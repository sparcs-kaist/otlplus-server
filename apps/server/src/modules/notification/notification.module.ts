import { Module } from '@nestjs/common'
import { RmqModule } from '@otl/rmq/rmq.module'
import { QueueNames } from '@otl/rmq/settings'
import { NOTIFICATION_IN_PORT } from '@otl/server-nest/modules/notification/domain/notification.in.public.port'
import { NOTIFICATION_REPOSITORY } from '@otl/server-nest/modules/notification/domain/notification.repository'
import { NotificationController } from '@otl/server-nest/modules/notification/notification.controller'
import { NotificationService } from '@otl/server-nest/modules/notification/notification.service'

import { PrismaModule } from '@otl/prisma-client'
import { NotificationPrismaRepository } from '@otl/prisma-client/repositories/notification.repository'

@Module({
  imports: [PrismaModule, RmqModule.register()],
  providers: [
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: NotificationPrismaRepository,
    },
    {
      provide: NOTIFICATION_IN_PORT,
      useFactory: (notificationRepository, infoFCMClient, adFCMClient, nightAdFCMClient) => new NotificationService(notificationRepository, infoFCMClient, adFCMClient, nightAdFCMClient),
      inject: [NOTIFICATION_REPOSITORY, ...Object.values(QueueNames)],
    },
  ],
  controllers: [NotificationController],
  exports: [NOTIFICATION_IN_PORT],
})
export class NotificationModule {}
