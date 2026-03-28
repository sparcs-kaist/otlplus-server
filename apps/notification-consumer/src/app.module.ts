import { Module } from '@nestjs/common'
import { ClsPluginTransactional } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { RedisModule } from '@nestjs-modules/ioredis'
import { AppController } from '@otl/notification-consumer/app.controller'
import { AppService } from '@otl/notification-consumer/app.service'
import { DeadLetterController } from '@otl/notification-consumer/dead-letter.controller'
import { NotificationJobService } from '@otl/notification-consumer/job.service'
import { AGREEMENT_REPOSITORY } from '@otl/notification-consumer/out/agreement.repository'
import { NOTIFICATION_MQ } from '@otl/notification-consumer/out/notification.mq'
import { NOTIFICATION_REPOSITORY } from '@otl/notification-consumer/out/notification.repository'
import { NotificationSchedulerService } from '@otl/notification-consumer/schedule.service'
import settings from '@otl/notification-consumer/settings'
import { RmqConnectionModule } from '@otl/rmq'
import { NotificationFcmPublisher } from '@otl/rmq/exchanges/notification/notification.fcm.publish'
import { RmqModule } from '@otl/rmq/rmq.module'
import { SentryModule } from '@sentry/nestjs/setup'
import { ClsModule } from 'nestjs-cls'

import { PrismaModule, PrismaService } from '@otl/prisma-client'
import { AgreementPrismaRepository } from '@otl/prisma-client/repositories/agreement.repository'
import { NotificationPrismaRepository } from '@otl/prisma-client/repositories/notification.repository'

@Module({
  imports: [
    SentryModule.forRoot(),
    RmqModule,
    RmqConnectionModule.register(),
    PrismaModule.register(settings().ormconfig()),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
      plugins: [
        new ClsPluginTransactional({
          imports: [PrismaModule],
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: PrismaService,
          }),
        }),
      ],
    }),
    RedisModule.forRoot(settings().getRedisConfig()),
  ],
  controllers: [AppController, DeadLetterController],
  providers: [
    {
      provide: AGREEMENT_REPOSITORY,
      useClass: AgreementPrismaRepository,
    },
    {
      provide: NOTIFICATION_MQ,
      useClass: NotificationFcmPublisher,
    },
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: NotificationPrismaRepository,
    },
    AppService,
    NotificationSchedulerService,
    NotificationJobService,
  ],
})
export class AppModule {}
