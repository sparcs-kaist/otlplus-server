import { Module } from '@nestjs/common'
import { ClsPluginTransactional } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { RedisModule } from '@nestjs-modules/ioredis'
import { AppController } from '@otl/notification-consumer/app.controller'
import { AppService } from '@otl/notification-consumer/app.service'
import { DeadLetterController } from '@otl/notification-consumer/dead-letter.controller'
import { NotificationJobService } from '@otl/notification-consumer/job.service'
import { NotificationSchedulerService } from '@otl/notification-consumer/schedule.service'
import settings from '@otl/notification-consumer/settings'
import { RmqModule } from '@otl/rmq/rmq.module'
import { ClsModule } from 'nestjs-cls'

import { PrismaModule, PrismaService } from '@otl/prisma-client'

@Module({
  imports: [
    RmqModule.register(),
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
  providers: [AppService, NotificationSchedulerService, NotificationJobService],
})
export class AppModule {}
