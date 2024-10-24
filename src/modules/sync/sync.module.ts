import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SlackNotiService } from './slackNoti.service';
import { SyncController } from './sync.controller';
import { SyncScholarDBService } from './syncScholarDB.service';

@Module({
  controllers: [SyncController],
  providers: [SyncScholarDBService, SlackNotiService],
  imports: [PrismaModule],
})
export class SyncModule {}
