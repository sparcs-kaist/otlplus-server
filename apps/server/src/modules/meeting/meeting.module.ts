import { Module } from '@nestjs/common'

import { MeetingController } from './meeting.controller'
import { MeetingService } from './meeting.service'

@Module({
  controllers: [MeetingController],
  providers: [MeetingService],
})
export class MeetingModule {}
