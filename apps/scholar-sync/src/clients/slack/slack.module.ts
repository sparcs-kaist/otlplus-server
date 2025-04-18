import { Module } from '@nestjs/common'

import { SlackNotiService } from './slackNoti.service'

@Module({
  providers: [SlackNotiService],
  imports: [],
  exports: [SlackNotiService],
})
export class SlackModule {}
