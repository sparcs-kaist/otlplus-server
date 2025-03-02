import { SlackNotiService } from './slackNoti.service';
import { PrismaModule } from '@otl/scholar-sync/prisma/prisma.module';
import { Module } from '@nestjs/common';

@Module({
  providers: [SlackNotiService],
  imports: [PrismaModule],
  exports: [SlackNotiService],
})
export class SlackModule {}
