import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SyncModule } from '@otl/scholar-sync/modules/sync/sync.module';
import { PrismaModule } from '@otl/scholar-sync/prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '@otl/scholar-sync/modules/auth/auth.module';
import { AuthConfig } from '@otl/scholar-sync/modules/auth/auth.config';
import { AuthGuard } from '@otl/scholar-sync/modules/auth/guard/auth.guard';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [PrismaModule, SyncModule, AuthModule, ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useFactory: async (authConfig: AuthConfig) => {
        const env = process.env.NODE_ENV === undefined ? 'prod' : process.env.NODE_ENV;
        const authChain = await authConfig.config(env);
        return new AuthGuard(authChain);
      },
      inject: [AuthConfig],
    },
  ],
})
export class AppModule {}
