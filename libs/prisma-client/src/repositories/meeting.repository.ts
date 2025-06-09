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
  ): Promise<meeting_member> {
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

  public async updateMeetingResult(groupId: number, title: string, place: string, description: string, color: number) {
    return this.prisma.meeting_result.update({
      where: { meeting_group_id: groupId },
      data: {
        place,
        description,
        color,
        meeting_group: {
          update: {
            title,
          },
        },
      },
      include: EMeeting.Result.include,
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

  async getMeetingGroup(groupId: number) {
    return this.prisma.meeting_group.findUnique({
      where: {
        id: groupId,
      },
      include: EMeeting.Group.include,
    })
  }

  async deleteMeetingGroup(groupId: number) {
    return this.prisma.$transaction(async (tx) => {
      // 1. 먼저 timeblock들을 삭제
      await tx.meeting_member_timeblock.deleteMany({
        where: { meeting_member: { meeting_group_id: groupId } },
      })
      await tx.meeting_result_timeblock.deleteMany({
        where: { meeting_result: { meeting_group_id: groupId } },
      })

      // 2. 그 다음 member와 result 삭제
      await tx.meeting_member.deleteMany({
        where: { meeting_group_id: groupId },
      })
      await tx.meeting_result.delete({
        where: { meeting_group_id: groupId },
      })

      // 3. 마지막으로 group과 관련 데이터 삭제
      await tx.meeting_group_day.deleteMany({
        where: { meeting_group_id: groupId },
      })
      await tx.meeting_group.delete({
        where: { id: groupId },
      })
    })
  }

  async updateMemberUserId(groupId: number, userId: number, studentNumber: string, name: string) {
    return this.prisma.meeting_member.update({
      where: { id: groupId, student_number: studentNumber },
      data: { user_id: userId, name },
    })
  }

  async createMeetingResult(group: EMeeting.Group, timeblocks: TimeBlock[], color: number): Promise<EMeeting.Result> {
    return this.prisma.meeting_result.create({
      data: {
        meeting_group_id: group.id,
        start_week: group.start_week,
        end_week: group.end_week,
        color,
        timeblocks: {
          createMany: {
            data: timeblocks.map((block) => ({
              ...makeTimeBlockDayToDB(block.day),
              time_index: block.timeIndex,
            })),
          },
        },
      },
      include: EMeeting.Result.include,
    })
  }
}
