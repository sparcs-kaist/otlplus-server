import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { RmqConnectionModule } from '@otl/rmq'
import { NotificationBatchFcmPublisher } from '@otl/rmq/exchanges/notification/notification.batch-fcm.publish'
import { NotificationFcmPublisher } from '@otl/rmq/exchanges/notification/notification.fcm.publish'
import { RmqModule } from '@otl/rmq/rmq.module'
import { AgreementPublicService } from '@otl/server-nest/modules/agreement/agreement.public.service'
import { AGREEMENT_IN_PUBLIC_PORT } from '@otl/server-nest/modules/agreement/domain/agreement.in.port'
import { AGREEMENT_REPOSITORY } from '@otl/server-nest/modules/agreement/domain/agreement.repository'
import { DEVICE_REPOSITORY } from '@otl/server-nest/modules/device/domain/device.repository'
import {
  NOTIFICATION_IN_PORT,
  NOTIFICATION_IN_PUBLIC_PORT,
} from '@otl/server-nest/modules/notification/domain/notification.in.port'
import { NOTIFICATION_MQ } from '@otl/server-nest/modules/notification/domain/notification.mq'
import { NOTIFICATION_REPOSITORY } from '@otl/server-nest/modules/notification/domain/notification.repository'
import {
  PUSH_NOTIFICATION_IN_PORT,
  PUSH_NOTIFICATION_PREFERENCE_PORT,
} from '@otl/server-nest/modules/notification/domain/push-notification.in.port'
import { PUSH_NOTIFICATION_MQ } from '@otl/server-nest/modules/notification/domain/push-notification.mq'
import { PUSH_NOTIFICATION_REPOSITORY } from '@otl/server-nest/modules/notification/domain/push-notification.repository'
import { NotificationController } from '@otl/server-nest/modules/notification/notification.controller'
import { NotificationPrivateService } from '@otl/server-nest/modules/notification/notification.private.service'
import { NotificationPublicService } from '@otl/server-nest/modules/notification/notification.public.service'
import { PushNotificationController } from '@otl/server-nest/modules/notification/push-notification.controller'
import { PushNotificationService } from '@otl/server-nest/modules/notification/push-notification.service'
import { PushNotificationPreferenceController } from '@otl/server-nest/modules/notification/push-notification-preference.controller'
import { PushNotificationPreferenceService } from '@otl/server-nest/modules/notification/push-notification-preference.service'
import { CronSchedulerService } from '@otl/server-nest/modules/notification/services/cron-scheduler.service'
import { DigestService } from '@otl/server-nest/modules/notification/services/digest.service'
import { NotificationSchedulerService as PushNotificationSchedulerService } from '@otl/server-nest/modules/notification/services/notification-scheduler.service'
import { RateLimiterService } from '@otl/server-nest/modules/notification/services/rate-limiter.service'
import { TargetResolverService } from '@otl/server-nest/modules/notification/services/target-resolver.service'
import { TemplateEngineService } from '@otl/server-nest/modules/notification/services/template-engine.service'

import { PrismaModule } from '@otl/prisma-client'
import { AgreementPrismaRepository } from '@otl/prisma-client/repositories/agreement.repository'
import { DevicePrismaRepository } from '@otl/prisma-client/repositories/device.repository'
import { NotificationPrismaRepository } from '@otl/prisma-client/repositories/notification.repository'
import { PushNotificationPrismaRepository } from '@otl/prisma-client/repositories/push-notification.repository'

@Module({
  imports: [PrismaModule, RmqModule, RmqConnectionModule.register(), ScheduleModule.forRoot()],
  providers: [
    // --- Existing notification system ---
    {
      provide: AGREEMENT_REPOSITORY,
      useClass: AgreementPrismaRepository,
    },
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: NotificationPrismaRepository,
    },
    {
      provide: NOTIFICATION_MQ,
      useClass: NotificationFcmPublisher,
    },
    {
      provide: NOTIFICATION_IN_PORT,
      useClass: NotificationPrivateService,
    },
    {
      provide: NOTIFICATION_IN_PUBLIC_PORT,
      useClass: NotificationPublicService,
    },
    {
      provide: AGREEMENT_IN_PUBLIC_PORT,
      useClass: AgreementPublicService,
    },
    // --- New push notification system ---
    {
      provide: PUSH_NOTIFICATION_REPOSITORY,
      useClass: PushNotificationPrismaRepository,
    },
    {
      provide: PUSH_NOTIFICATION_MQ,
      useClass: NotificationBatchFcmPublisher,
    },
    {
      provide: DEVICE_REPOSITORY,
      useClass: DevicePrismaRepository,
    },
    {
      provide: PUSH_NOTIFICATION_IN_PORT,
      useClass: PushNotificationService,
    },
    {
      provide: PUSH_NOTIFICATION_PREFERENCE_PORT,
      useClass: PushNotificationPreferenceService,
    },
    // --- Services ---
    TemplateEngineService,
    RateLimiterService,
    DigestService,
    TargetResolverService,
    PushNotificationSchedulerService,
    CronSchedulerService,
  ],
  controllers: [NotificationController, PushNotificationController, PushNotificationPreferenceController],
  exports: [NOTIFICATION_IN_PUBLIC_PORT, PUSH_NOTIFICATION_IN_PORT],
})
export class NotificationModule {}
