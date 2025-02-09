import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SyncModule } from '@otl/scholar-sync/modules/sync/sync.module';
import { SlackModule } from '@otl/scholar-sync/clients/slack/slack.module';
import { ScholarModule } from '@otl/scholar-sync/clients/scholar/scholar.module';
import { PrismaModule } from '@otl/scholar-sync/prisma/prisma.module';

@Module({
  imports: [PrismaModule, SyncModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
