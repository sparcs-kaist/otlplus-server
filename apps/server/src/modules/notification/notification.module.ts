import { Module } from '@nestjs/common'
import { RmqModule } from '@otl/rmq/rmq.module'
import { AGREEMENT_REPOSITORY } from '@otl/server-nest/modules/agreement/domain/agreement.repository'
import {
  NOTIFICATION_IN_PORT,
  NOTIFICATION_IN_PUBLIC_PORT,
} from '@otl/server-nest/modules/notification/domain/notification.in.port'
import { NOTIFICATION_REPOSITORY } from '@otl/server-nest/modules/notification/domain/notification.repository'
import { NotificationController } from '@otl/server-nest/modules/notification/notification.controller'
import { NotificationPrivateService } from '@otl/server-nest/modules/notification/notification.private.service'
import { NotificationPublicService } from '@otl/server-nest/modules/notification/notification.public.service'

import { PrismaModule } from '@otl/prisma-client'
import { AgreementPrismaRepository } from '@otl/prisma-client/repositories/agreement.repository'
import { NotificationPrismaRepository } from '@otl/prisma-client/repositories/notification.repository'

@Module({
  imports: [PrismaModule, RmqModule.register()],
  providers: [
    {
      provide: AGREEMENT_REPOSITORY,
      useClass: AgreementPrismaRepository,
    },
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: NotificationPrismaRepository,
    },
    {
      provide: NOTIFICATION_IN_PORT,
      useClass: NotificationPrivateService,
    },
    {
      provide: NOTIFICATION_IN_PUBLIC_PORT,
      useClass: NotificationPublicService,
    },
  ],
  controllers: [NotificationController],
  exports: [NOTIFICATION_IN_PUBLIC_PORT],
})
export class NotificationModule {}
