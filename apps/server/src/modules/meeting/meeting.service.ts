import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { IMeeting } from '@otl/server-nest/common/interfaces'
import { makeDBtoTimeBlockDay, makeTimeToTimeIndex } from '@otl/server-nest/common/utils/time.utils'
import { session_userprofile } from '@prisma/client'

import { TimeBlock } from '@otl/common/enum/time'

import { MeetingRepository, TimetableRepository, UserRepository } from '@otl/prisma-client'
import { EMeeting } from '@otl/prisma-client/entities/EMeeting'

@Injectable()
export class MeetingService {
  constructor(
    private readonly meetingRepository: MeetingRepository,
    private readonly userRepository: UserRepository,
    private readonly timetableRepository: TimetableRepository,
  ) {}

  async createMeetingGroup(user: session_userprofile, group: IMeeting.GroupCreateDto): Promise<IMeeting.Group> {
    const createdGroup = await this.meetingRepository.createMeetingGroup(user, group)
    const meetingGroup = this.makeEMeetingGroupToIMeetingGroup(createdGroup)
    return meetingGroup
  }

  async patchMeetingGroupTitle(
    user: session_userprofile,
    groupId: number,
    title: string,
  ): Promise<IMeeting.GroupNameUpdateResponse> {
    await this.checkGroupLeader(user, groupId)
    const updatedGroup = await this.meetingRepository.patchMeetingGroupTitle(groupId, title)
    return {
      id: updatedGroup.id,
      title: updatedGroup.title,
    }
  }

  async deleteMeetingGroup(user: session_userprofile, groupId: number) {
    await this.checkGroupLeader(user, groupId)
    await this.meetingRepository.deleteMeetingGroup(groupId)
  }

  async postMeetingGroupMember(
    user: session_userprofile | { name: string; student_id: string },
    groupId: number,
  ): Promise<IMeeting.GroupMemberCreateResponse> {
    const group = await this.meetingRepository.getMeetingGroup(groupId)
    if (!group) {
      throw new NotFoundException('Group not found')
    }
    if (group.members.some((member) => member.student_number === user.student_id)) {
      if ('user_id' in user && group.members.find((member) => member.user_id === user.user_id)?.user_id === null) {
        await this.meetingRepository.updateMemberUserId(groupId, user.id, user.student_id, user.name_kor)
      } else {
        throw new ForbiddenException('You are already a member of this group')
      }
    }
    let member
    if ('user_id' in user) {
      member = await this.meetingRepository.createMember(groupId, user.user_id, user.student_id, user.name_kor)
    } else {
      member = await this.meetingRepository.createMember(groupId, null, user.student_id, user.name)
    }
    return {
      member: {
        id: member.id,
        groupId: member.meeting_group_id,
        studentNumber: member.student_number,
        name: member.name,
        user_id: member.user_id,
      },
    }
  }

  async postMeetingGroupResult(user: session_userprofile, groupId: number, body: IMeeting.GroupResultCreateDto) {
    const [group, _] = await Promise.all([
      this.meetingRepository.getMeetingGroup(groupId),
      this.checkGroupLeader(user, groupId),
    ])

    if (!group) {
      throw new NotFoundException('Group not found')
    }

    const result = await this.meetingRepository.createMeetingResult(group, body.timeBlocks, body.color)
    return this.makeEMeetingResultToIMeetingResult({ ...result, meeting_group: group })
  }

  async patchMeetingGroupResult(user: session_userprofile, groupId: number, body: IMeeting.GroupResultUpdateDto) {
    const [group, _] = await Promise.all([
      this.meetingRepository.getMeetingGroup(groupId),
      this.checkGroupLeader(user, groupId),
    ])

    if (!group) {
      throw new NotFoundException('Group not found')
    }

    const result = await this.meetingRepository.updateMeetingResult(
      groupId,
      body.title,
      body.place,
      body.description,
      body.color,
    )
    return this.makeEMeetingResultToIMeetingResult({ ...result, meeting_group: group })
  }

  // 멤버 가능 시간 업데이트
  async putMeetingGroupSchedule(
    user: session_userprofile | string,
    groupId: number,
    timeBlocks: TimeBlock[],
  ): Promise<void> {
    const group = await this.meetingRepository.getMeetingGroup(groupId)
    if (!group) {
      throw new NotFoundException('Group not found')
    }

    const userInfo = typeof user === 'string' ? await this.userRepository.findByStudentId(user) : user

    const member = await this.meetingRepository.getMemberWithTimeblocks(userInfo.id, groupId)
    if (!member) {
      throw new ForbiddenException('You are not a member of this group')
    }

    // 해당 유저의 timeblock id를 조회
    const times = member.timeblocks
    const dbTimeBlocks = timeBlocks.map((timeBlock) => ({
      day: timeBlock.day,
      time_index: timeBlock.timeIndex,
    }))

    // 시간대에 속하는 id를 추려냄
    const availableTimeIds = times
      .filter((time) => dbTimeBlocks.some((dbTime) => dbTime.day === time.day && dbTime.time_index === time.time_index))
      .map((time) => time.id)

    // 멤버 가능 시간 업데이트
    await this.meetingRepository.updateMemberTimeblocks(member.id, availableTimeIds)
  }

  async getMeetingGroupSummaries(user: session_userprofile): Promise<IMeeting.GroupSummary[]> {
    const groups = await this.meetingRepository.getMeetingGroups(user.id)
    return groups.map((group) => ({
      title: group.title,
      id: group.id,
      isLeader: group.leader_user_id === user.id,
      currentMember: group.members.length,
      max_members: group.max_member,
      has_result: group.result !== null,
    }))
  }

  async getMeetingGroup(groupId: number, user: session_userprofile | string): Promise<IMeeting.GroupStatus> {
    const userInfo = typeof user === 'string' ? await this.userRepository.findByStudentId(user) : user

    const group = await this.meetingRepository.getMeetingGroup(groupId)

    const timetable = await this.timetableRepository.getTimetableSummary(userInfo.id)
    const meetingGroup = this.makeEMeetingGroupToIMeetingGroup(group)
    return {
      id: meetingGroup.id,
      name: meetingGroup.title,
      begin: meetingGroup.begin,
      maxMember: meetingGroup.max_member,
      currentMember: meetingGroup.members,
      schedule: meetingGroup.schedule,
      timetable,
      isLeader: group.leader_user_id === userInfo.id,
    }
  }

  // Private Methods

  private async checkGroupLeader(user: session_userprofile, groupId: number) {
    const group = await this.meetingRepository.getMeetingGroup(groupId)
    if (!group) {
      throw new NotFoundException('Group not found')
    }
    if (group.leader_user_id !== user.id) {
      throw new ForbiddenException('You are not the leader of this group')
    }
  }

  private makeEMeetingGroupToIMeetingGroup(group: EMeeting.Group): IMeeting.Group {
    // const schedule: IMeeting.Schedule[] = []
    const days = group.days.map((day) => makeDBtoTimeBlockDay(day.day, day.weekday))
    const schedule: IMeeting.Schedule[] = []

    const members: IMeeting.Member[] = group.members.map((member) => ({
      id: member.id,
      user_id: member.user_id || undefined,
      studentNumber: member.student_number,
      name: member.name,
      available_timeBlock: member.timeblocks.map((timeblock) => ({
        day: makeDBtoTimeBlockDay(timeblock.day, timeblock.weekday),
        timeIndex: timeblock.time_index,
        duration: 1,
      })),
    }))

    for (const day of days) {
      for (let i = makeTimeToTimeIndex(group.begin); i <= makeTimeToTimeIndex(group.end); i += 1) {
        schedule.push({
          timeBlock: {
            day,
            timeIndex: i,
            duration: 1,
          },
          available_members: [],
          unavailable_members: [],
        })
        for (const member of members) {
          if (member.available_timeBlock.find((timeblock) => timeblock.timeIndex === i)) {
            schedule[schedule.length - 1].available_members.push(member)
          } else {
            schedule[schedule.length - 1].unavailable_members.push(member)
          }
        }
      }
    }
    return {
      id: group.id,
      year: group.year,
      semester: group.semester,
      begin: group.begin,
      end: group.end,
      start_week: group.start_week,
      end_week: group.end_week,
      title: group.title,
      leader_user_profile_id: group.leader_user_id,
      max_member: group.max_member,
      days,
      schedule,
      members,
      result: group.result
        ? this.makeEMeetingResultToIMeetingResult({ ...group.result, meeting_group: group })
        : undefined,
    }
  }

  private makeEMeetingResultToIMeetingResult(result: EMeeting.Result): IMeeting.Result {
    return {
      id: result.id,
      group_id: result.meeting_group_id,
      year: result.meeting_group.year,
      semester: result.meeting_group.semester,
      start_week: result.meeting_group.start_week,
      end_week: result.meeting_group.end_week,
      title: result.meeting_group.title,
      place: result.place,
      description: result.description,
      color: result.color,
      timeBlocks: result.timeblocks.map((timeblock) => {
        const available_members = result.meeting_group.members.filter((member) =>
          member.timeblocks.some(
            (tb) => tb.day === timeblock.day && tb.time_index === timeblock.time_index && tb.is_available,
          ),
        )
        const unavailable_members = result.meeting_group.members.filter((member) =>
          member.timeblocks.some(
            (tb) => tb.day === timeblock.day && tb.time_index === timeblock.time_index && !tb.is_available,
          ),
        )
        return {
          day: makeDBtoTimeBlockDay(timeblock.day, timeblock.weekday),
          timeIndex: timeblock.time_index,
          duration: 1,
          available_members: available_members.map((member) => ({
            id: member.id,
            user_id: member.user_id || undefined,
            studentNumber: member.student_number,
            name: member.name,
          })),
          unavailable_members: unavailable_members.map((member) => ({
            id: member.id,
            user_id: member.user_id || undefined,
            studentNumber: member.student_number,
            name: member.name,
          })),
        }
      }),
    }
  }
}
