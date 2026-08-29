import {
  type CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
  type RawBodyRequest,
  UnauthorizedException,
} from '@nestjs/common'
import type { Request } from 'express'

import { CHANNEL_TALK_SIGNING_KEY } from './channel-talk.contract'
import { verifyChannelTalkSignature } from './channel-talk-signature'

@Injectable()
export class ChannelTalkSignatureGuard implements CanActivate {
  constructor(
    @Inject(CHANNEL_TALK_SIGNING_KEY)
    private readonly signingKey: string | undefined,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RawBodyRequest<Request>>()
    const signature = request.headers['x-signature']

    if (typeof signature !== 'string' || !this.signingKey || !request.rawBody) {
      throw new UnauthorizedException('Invalid ChannelTalk signature')
    }
    if (!verifyChannelTalkSignature(signature, this.signingKey, request.rawBody)) {
      throw new UnauthorizedException('Invalid ChannelTalk signature')
    }
    return true
  }
}
