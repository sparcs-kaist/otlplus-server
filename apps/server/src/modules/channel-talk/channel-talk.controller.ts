import {
  Body, Controller, Param, Put, UseGuards,
} from '@nestjs/common'
import { Public } from '@otl/server-nest/common/decorators/skip-auth.decorator'

import { type ChannelTalkResponse } from './channel-talk.contract'
import { ChannelTalkService } from './channel-talk.service'
import { ChannelTalkSignatureGuard } from './channel-talk-signature.guard'

@Public()
@UseGuards(ChannelTalkSignatureGuard)
@Controller('functions')
export class ChannelTalkController {
  constructor(private readonly channelTalkService: ChannelTalkService) {}

  @Put(':version')
  async handle(@Param('version') version: string, @Body() body: unknown): Promise<ChannelTalkResponse> {
    return await this.channelTalkService.handle(version, body)
  }
}
