import { SlackNotiService } from './slackNoti.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [SlackNotiService],
  imports: [],
  exports: [SlackNotiService],
})
export class SlackModule {}
