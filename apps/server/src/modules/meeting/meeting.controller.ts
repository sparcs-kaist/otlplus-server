import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { Public } from '@otl/server-nest/common/decorators/skip-auth.decorator'
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

  @Public()
  @Post('/group/:groupId/member')
  async postMeetingGroupMember(
    @Param('groupId') groupId: string,
    @GetUser() user: session_userprofile,
    @Body() body: IMeeting.GroupMemberCreateDto,
  ): Promise<IMeeting.GroupMemberCreateResponse> {
    const userInfo = user ?? body.user
    if (!userInfo) {
      throw new BadRequestException('User info is required')
    }
    return this.meetingService.postMeetingGroupMember(userInfo, Number(groupId))
  }

  @Post('/group/:groupId/result')
  async postMeetingGroupResult(
    @Param('groupId') groupId: string,
    @GetUser() user: session_userprofile,
    @Body() body: IMeeting.GroupResultCreateDto,
  ) {
    return this.meetingService.postMeetingGroupResult(user, Number(groupId), body)
  }

  @Patch('/group/:groupId/result/timeBlock')
  async patchMeetingGroupResult(
    @Param('groupId') groupId: string,
    @GetUser() user: session_userprofile,
    @Body() body: IMeeting.GroupResultUpdateDto,
  ) {
    return this.meetingService.patchMeetingGroupResult(user, Number(groupId), body)
  }

  @Public()
  @Put('/group/:groupId/schedule')
  async putMeetingGroupSchedule(
    @Param('groupId') groupId: string,
    @GetUser() user: session_userprofile,
    @Body() body: IMeeting.GroupScheduleUpdateDto,
  ) {
    const userInfo = user ?? body.studentNumber
    if (!userInfo) {
      throw new BadRequestException('User info is required')
    }
    return this.meetingService.putMeetingGroupSchedule(userInfo, Number(groupId), body.timeBlocks)
  }

  @Get('/groups')
  async getMeetingGroupSummaries(@GetUser() user: session_userprofile): Promise<IMeeting.GroupSummary[]> {
    return this.meetingService.getMeetingGroupSummaries(user)
  }

  @Public()
  @Get('/groups/:groupId')
  async getMeetingGroup(
    @Param('groupId') groupId: string,
    @GetUser() user: session_userprofile,
    @Body() body: IMeeting.UserStudentIdDto,
  ): Promise<IMeeting.GroupStatus> {
    const userInfo = user ?? body.user?.studentNumber
    if (!userInfo) {
      throw new BadRequestException('User information is required')
    }
    return this.meetingService.getMeetingGroup(Number(groupId), userInfo)
  }
}
