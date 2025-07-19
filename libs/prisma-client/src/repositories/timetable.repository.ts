import { Injectable } from '@nestjs/common'
import { Prisma, PrismaClient, session_userprofile } from '@prisma/client'

import { PrismaReadService } from '@otl/prisma-client/prisma.read.service'
import { PrismaService } from '@otl/prisma-client/prisma.service'

import { ELecture } from '../entities/ELecture'
import { ETimetable } from '../entities/ETimetable'

@Injectable()
export class TimetableRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  async getTimetables(
    user: session_userprofile,
    year?: number | null,
    semester?: number | null,
    paginationAndSorting?: {
      orderBy?: Prisma.timetable_timetableOrderByWithRelationInput[]
      skip?: number
      take?: number
    },
  ): Promise<ETimetable.Details[]> {
    const skip = paginationAndSorting?.skip
    const take = paginationAndSorting?.take
    const orderBy = paginationAndSorting?.orderBy

    return this.prisma.timetable_timetable.findMany({
      include: ETimetable.Details.include,
      where: {
        year: year ?? undefined,
        semester: semester ?? undefined,
        user_id: user.id,
      },
      skip,
      take,
      orderBy,
    })
  }

  async getTimetableBasics(
    user: session_userprofile,
    year: number,
    semester: number,
    paginationAndSorting: {
      orderBy: Prisma.timetable_timetableOrderByWithRelationInput
      skip?: number
      take?: number
    },
  ): Promise<ETimetable.Basic[]> {
    const { skip } = paginationAndSorting
    const { take } = paginationAndSorting
    const { orderBy } = paginationAndSorting

    return this.prisma.timetable_timetable.findMany({
      where: {
        year,
        semester,
        user_id: user.id,
      },
      skip,
      take,
      orderBy,
    })
  }

  async createTimetable(
    user: session_userprofile,
    year: number,
    semester: number,
    arrangeOrder: number,
    lectures: ELecture.Details[],
  ): Promise<ETimetable.Details> {
    return this.prisma.timetable_timetable.create({
      data: {
        user_id: user.id,
        year,
        semester,
        arrange_order: arrangeOrder,
        timetable_timetable_lectures: {
          createMany: {
            data: lectures.map((lecture) => ({
              lecture_id: lecture.id,
            })),
          },
        },
      },
      include: ETimetable.Details.include,
    })
  }

  async getTimeTableBasicById(timeTableId: number) {
    return this.prisma.timetable_timetable.findUniqueOrThrow({
      where: {
        id: timeTableId,
      },
    })
  }

  async addLectureToTimetable(timeTableId: number, lectureId: number) {
    return this.prisma.timetable_timetable_lectures.create({
      data: {
        timetable_id: timeTableId,
        lecture_id: lectureId,
      },
    })
  }

  async getTimeTableById(timeTableId: number): Promise<ETimetable.Details> {
    return this.prisma.timetable_timetable.findUniqueOrThrow({
      include: ETimetable.Details.include,
      where: {
        id: timeTableId,
      },
    })
  }

  async removeLectureFromTimetable(timeTableId: number, lectureId: number) {
    return this.prisma.timetable_timetable_lectures.delete({
      where: {
        timetable_id_lecture_id: {
          timetable_id: timeTableId,
          lecture_id: lectureId,
        },
      },
    })
  }

  async deleteById(timetableId: number, tx?: PrismaClient) {
    let prismaClient: PrismaClient = this.prisma
    if (tx) {
      prismaClient = tx
    }
    await prismaClient.timetable_timetable_lectures.deleteMany({
      where: {
        timetable_id: timetableId,
      },
    })
    return prismaClient.timetable_timetable.delete({
      where: {
        id: timetableId,
      },
    })
  }

  async updateOrder(id: number, arrange_order: number): Promise<ETimetable.Basic> {
    return this.prisma.timetable_timetable.update({
      where: {
        id,
      },
      data: {
        arrange_order,
      },
    })
  }

  async getLecturesWithClassTimes(timetableId: number) {
    return this.prismaRead.timetable_timetable_lectures.findMany({
      where: { timetable_id: timetableId },
      include: ETimetable.WithLectureClasstimes.include,
    })
  }

  async getTimeTableLectures(timetableId: number): Promise<number[]> {
    return (
      await this.prismaRead.timetable_timetable_lectures.findMany({
        where: { timetable_id: timetableId },
      })
    ).map((lecture) => lecture.lecture_id)
  }
}
