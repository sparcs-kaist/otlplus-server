import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ScheduleModule } from '@nestjs/schedule'
import { ClsPluginTransactional } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { RmqConnectionModule, RmqModule } from '@otl/rmq'
import { AuthConfig } from '@otl/scholar-sync/modules/auth/auth.config'
import { AuthModule } from '@otl/scholar-sync/modules/auth/auth.module'
import { AuthGuard } from '@otl/scholar-sync/modules/auth/guard/auth.guard'
import { SyncModule } from '@otl/scholar-sync/modules/sync/sync.module'
import settings from '@otl/scholar-sync/settings'
import { WinstonModule } from 'nest-winston'
import { ClsModule } from 'nestjs-cls'

import { PrismaService } from '@otl/prisma-client'
import { PrismaModule } from '@otl/prisma-client/prisma.module'

import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [
    PrismaModule.register(settings().ormconfig()),
    RmqModule,
    RmqConnectionModule.register(),
    SyncModule,
    AuthModule,
    ScheduleModule.forRoot(),
    WinstonModule.forRootAsync({
      useFactory: () => settings().loggingConfig(),
    }),
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useFactory: async (authConfig: AuthConfig) => {
        const env = process.env.NODE_ENV === undefined ? 'prod' : process.env.NODE_ENV
        const authChain = await authConfig.config(env)
        return new AuthGuard(authChain)
      },
      inject: [AuthConfig],
    },
  ],
})
export class AppModule {}
