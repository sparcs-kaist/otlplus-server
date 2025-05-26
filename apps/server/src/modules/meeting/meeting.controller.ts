import { Body, Controller, Post } from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { IMeeting } from '@otl/server-nest/common/interfaces'
import { session_userprofile } from '@prisma/client'

import { MeetingService } from './meeting.service'

@Controller('api/meeting')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Post('/group')
  async createMeetingGroup(@Body() body: IMeeting.GroupCreateDto, @GetUser() user: session_userprofile) {
    return this.meetingService.createMeetingGroup(user, body)
  }
}
