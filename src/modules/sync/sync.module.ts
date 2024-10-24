import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SlackNotiService } from './slackNoti.service';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';

@Module({
  controllers: [SyncController],
  providers: [SyncService, SlackNotiService],
  imports: [PrismaModule],
})
export class SyncModule {}
