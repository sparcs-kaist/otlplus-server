import { Module } from '@nestjs/common'
import { CoursesModule } from '@otl/server-nest/modules/courses/courses.module'
import { CoursesService } from '@otl/server-nest/modules/courses/courses.service'
import settings from '@otl/server-nest/settings'

import { CHANNEL_TALK_COURSE_CATALOG, CHANNEL_TALK_SIGNING_KEY } from './channel-talk.contract'
import { ChannelTalkController } from './channel-talk.controller'
import { ChannelTalkService } from './channel-talk.service'
import { ChannelTalkSignatureGuard } from './channel-talk-signature.guard'

@Module({
  imports: [CoursesModule],
  controllers: [ChannelTalkController],
  providers: [
    ChannelTalkService,
    ChannelTalkSignatureGuard,
    {
      provide: CHANNEL_TALK_COURSE_CATALOG,
      useExisting: CoursesService,
    },
    {
      provide: CHANNEL_TALK_SIGNING_KEY,
      useFactory: () => settings().getChannelTalkConfig().signingKey,
    },
  ],
})
export class ChannelTalkModule {}
