import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { IMeeting } from '@otl/server-nest/common/interfaces'
import { makeDBtoTimeBlockDay, makeTimeToTimeIndex } from '@otl/server-nest/common/utils/time.utils'
import { session_userprofile } from '@prisma/client'

import { MeetingRepository } from '@otl/prisma-client'
import { EMeeting } from '@otl/prisma-client/entities/EMeeting'

@Injectable()
export class MeetingService {
  constructor(private readonly meetingRepository: MeetingRepository) {}

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
          }
          else {
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
        const available_members = result.meeting_group.members.filter((member) => member.timeblocks.some(
          (tb) => tb.day === timeblock.day && tb.time_index === timeblock.time_index && tb.is_available,
        ))
        const unavailable_members = result.meeting_group.members.filter((member) => member.timeblocks.some(
          (tb) => tb.day === timeblock.day && tb.time_index === timeblock.time_index && !tb.is_available,
        ))
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
