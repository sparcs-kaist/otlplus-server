import {
  Body, Controller, Delete, Param, Patch, Post,
} from '@nestjs/common'
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

  @Patch('/group/:groupId/title')
  async patchMeetingGroupTitle(
    @Param('groupId') groupId: string,
    @Body() body: IMeeting.GroupUpdateNameDto,
    @GetUser() user: session_userprofile,
  ) {
    return this.meetingService.patchMeetingGroupTitle(user, Number(groupId), body.title)
  }

  @Delete('/group/:groupId')
  async deleteMeetingGroup(@Param('groupId') groupId: string, @GetUser() user: session_userprofile) {
    return this.meetingService.deleteMeetingGroup(user, Number(groupId))
  }
}
