import { Injectable } from '@nestjs/common'
import { IMeeting } from '@otl/server-nest/common/interfaces'
import { session_userprofile } from '@prisma/client'

import { MeetingRepository } from '@otl/prisma-client'
import { EMeeting } from '@otl/prisma-client/entities/EMeeting'

@Injectable()
export class MeetingService {
  constructor(private readonly meetingRepository: MeetingRepository) {}

  async createMeetingGroup(user: session_userprofile, group: IMeeting.GroupCreateDto): Promise<IMeeting.Group> {
    const createdGroup = await this.meetingRepository.createMeetingGroup(user, group)

    return {
      ...createdGroup,
      days: createdGroup.days.map((day) => ({
        day: day.day,
        weekday: day.weekday,
      })),
      schedule: createdGroup.days.map((day) => ({
        timeBlock: day.time_block,
        available_members: [],
        unavailable_members: [],
      })),
      members: createdGroup.members.map((member) => ({
        id: member.id,
        user_id: member.user_id,
        studentNumber: member.student_number,
        name: member.name,
        available_timeBlock: [],
      })),
    }
  }

  private makeEMeetingGroupToIMeetingGroup(group: EMeeting.Group): IMeeting.Group {
    // const schedule: IMeeting.Schedule[] = []

    return {
      ...group,
      days: group.days.map((day) => ({
        day: day.day,
        weekday: day.weekday,
      })),
      schedule: group.days.map((day) => ({
        timeBlock: day.time_block,
        available_members: [],
        unavailable_members: [],
      })),
    }
  }
}
