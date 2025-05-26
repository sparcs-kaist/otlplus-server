import { Injectable } from '@nestjs/common'
import {
  makeDBtoTimeBlockDay,
  makeTimeBlockDayToDB,
  makeTimeIndexToTime,
} from '@otl/server-nest/common/utils/time.utils'
import { meeting_member, session_userprofile } from '@prisma/client'

import { TimeBlock, TimeBlockDay } from '@otl/common/enum/time'

import { EMeeting } from '../entities/EMeeting'
import { PrismaService } from '../prisma.service'

interface IMeetingGroupCreate {
  title: string
  begin: number
  end: number
  maxMember: number
  year: number
  semester: number
  startWeek: number
  endWeek: number
  days: TimeBlockDay[]
}

@Injectable()
export class MeetingRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async createMeetingGroup(
    user: session_userprofile,
    meetingGroup: IMeetingGroupCreate,
  ): Promise<EMeeting.Group> {
    return this.prisma.meeting_group.create({
      data: {
        leader_user_id: user.id,
        title: meetingGroup.title,
        begin: meetingGroup.begin,
        end: meetingGroup.end,
        max_member: meetingGroup.maxMember,
        year: meetingGroup.year,
        semester: meetingGroup.semester,
        start_week: meetingGroup.startWeek,
        end_week: meetingGroup.endWeek,

        days: {
          createMany: {
            data: meetingGroup.days.map((day) => ({
              day: day instanceof Date ? day : null,
            })),
          },
        },
        members: {
          createMany: {
            data: {
              user_id: user.id,
              student_number: user.student_id,
              name: user.name_kor,
            },
          },
        },
      },
      include: EMeeting.Group.include,
    })
  }

  async createMember(
    groupId: meeting_member['meeting_group_id'],
    userId: meeting_member['user_id'],
    studentNumber: meeting_member['student_number'],
    name: meeting_member['name'],
  ) {
    return this.prisma.$transaction(async (tx) => {
      const group = await tx.meeting_group.findUnique({
        where: {
          id: groupId,
        },
        include: EMeeting.Group.include,
      })

      if (!group) {
        throw new Error('Group not found')
      }

      const member = await tx.meeting_member.create({
        data: {
          meeting_group_id: groupId,
          user_id: userId,
          student_number: studentNumber,
          name,
        },
      })

      const blocks = this.makeScheduleBlocks(
        group.begin,
        group.end,
        group.days.map((day) => makeDBtoTimeBlockDay(day.day, day.weekday)),
      )

      await tx.meeting_member_timeblock.createMany({
        data: blocks.map((block) => ({
          meeting_member_id: member.id,
          ...makeTimeBlockDayToDB(block.day),
          time_index: block.timeIndex,
          is_available: false,
        })),
      })

      return member
    })
  }

  public async updateMemberSchedule(group_member_id: meeting_member['id'], schedule: TimeBlock[]) {
    return this.prisma.$transaction(async (tx) => {
      await tx.meeting_member_timeblock.updateMany({
        where: {
          meeting_member_id: group_member_id,
        },
        data: schedule.map((block) => ({
          ...block,
          ...makeTimeBlockDayToDB(block.day),
          time_index: block.timeIndex,
          is_available: false,
        })),
      })

      const availableBlocks = schedule.map((block) => ({
        ...block,
        ...makeTimeBlockDayToDB(block.day),
        time_index: block.timeIndex,
        is_available: true,
      }))

      const timeblocks = await tx.meeting_member_timeblock.updateMany({
        data: availableBlocks,
      })

      return timeblocks
    })
  }

  // util function
  public makeScheduleBlocks(begin: number, end: number, days: TimeBlockDay[]) {
    const blocks: TimeBlock[] = []

    const startIndex = (begin - 8) * 2
    const endIndex = (end - 8) * 2

    for (const day of days) {
      const blocksToAdd = Array.from({ length: endIndex - startIndex }, (_, idx) => {
        const i = startIndex + idx
        return {
          day,
          timeIndex: i, // 8시부터 시작하므로 0시부터 시작하는 인덱스로 변환
          duration: 1,
          startTime: makeTimeIndexToTime(i),
          endTime: makeTimeIndexToTime(i + 1),
        }
      })
      blocks.push(...blocksToAdd)
    }

    return blocks
  }

  async patchMeetingGroupTitle(groupId: number, title: string) {
    return this.prisma.meeting_group.update({
      where: {
        id: groupId,
      },
      data: {
        title,
      },
    })
  }

  public async getMeetingGroup(groupId: number) {
    return this.prisma.meeting_group.findUnique({
      where: {
        id: groupId,
      },
      include: EMeeting.Group.include,
    })
  }
}
