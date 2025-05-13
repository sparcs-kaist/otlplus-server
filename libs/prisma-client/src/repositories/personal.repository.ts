import { Injectable } from '@nestjs/common'
import { makeTimeBlockDayToDB } from '@otl/server-nest/common/utils/time.utils'

import { TimeTableColorEnum } from '@otl/common/enum/color'
import { TimeBlock } from '@otl/common/enum/time'

import { EPersonal } from '../entities/EPersonal'
import { PrismaService } from '../prisma.service'

type PersonalCreateInput = {
  user_id: number
  year: number
  semester: number
  timeBlocks: TimeBlock[]
  timetable_id?: number
  title: string
  place?: string
  description?: string
  color: TimeTableColorEnum
}

type PersonalUpdateInput = {
  id: number
  title: string
  place?: string
  description?: string
  color: TimeTableColorEnum
  timeBlocks: TimeBlock[]
}

@Injectable()
export class PersonalsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPersonalBlock(personal: PersonalCreateInput): Promise<EPersonal.Basic> {
    const createdPersonal = await this.prisma.personal_block.create({
      data: {
        year: personal.year,
        semester: personal.semester,
        title: personal.title,
        place: personal.place,
        description: personal.description,
        color: personal.color,
        personal_timeblocks: {
          create: personal.timeBlocks.map((timeBlock) => {
            const { day, weekday } = makeTimeBlockDayToDB(timeBlock.day)
            return {
              day: day ?? null,
              weekday: weekday ?? null,
              start_time: timeBlock.startTime,
              end_time: timeBlock.endTime,
              time_index: timeBlock.timeIndex,
            }
          }),
        },
        timetable_timetable: {
          connect: {
            id: personal.timetable_id,
          },
        },
        session_userprofile: {
          connect: {
            id: personal.user_id,
          },
        },
      },
      include: EPersonal.Basic.include,
    })
    return createdPersonal
  }

  async updatePersonalBlock(personal: PersonalUpdateInput): Promise<EPersonal.Basic> {
    const updatedPersonal = await this.prisma.personal_block.update({
      where: { id: personal.id },
      data: {
        title: personal.title,
        place: personal.place,
        description: personal.description,
        color: personal.color,
        personal_timeblocks: {
          deleteMany: {
            personal_block_id: personal.id,
          },
          create: personal.timeBlocks.map((timeBlock) => {
            const { day, weekday } = makeTimeBlockDayToDB(timeBlock.day)
            return {
              day: day ?? null,
              weekday: weekday ?? null,
              start_time: timeBlock.startTime,
              end_time: timeBlock.endTime,
              time_index: timeBlock.timeIndex,
            }
          }),
        },
      },
      include: EPersonal.Basic.include,
    })
    return updatedPersonal
  }

  async deletePersonalBlock(id: number): Promise<EPersonal.Basic> {
    const deletedPersonal = await this.prisma.personal_block.delete({
      where: { id },
      include: EPersonal.Basic.include,
    })
    return deletedPersonal
  }

  async findPersonalBlockById(id: number): Promise<EPersonal.Basic | null> {
    const personalBlock = await this.prisma.personal_block.findUnique({
      where: { id },
      include: EPersonal.Basic.include,
    })
    return personalBlock
  }

  async findPersonalBlocksForTimetable(semester: number, year: number): Promise<EPersonal.Basic[]> {
    const personalBlocks = await this.prisma.personal_block.findMany({
      where: {
        semester,
        year,
      },
      include: EPersonal.Basic.include,
    })
    return personalBlocks
  }
}
