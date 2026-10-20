import { Injectable } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Prisma, session_userprofile } from '@prisma/client'

import { ELecture } from '../entities/ELecture'
import { ETimetable } from '../entities/ETimetable'

@Injectable()
export class TimetableRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async lockTimetable(timetableId: number): Promise<void> {
    if (!this.txHost.isTransactionActive()) {
      throw new Error('Timetable locks require a transaction')
    }
    await this.txHost.tx.$queryRaw`SELECT id FROM timetable_timetable WHERE id = ${timetableId} FOR UPDATE`
  }

  async getTimeTableWithItemsById(timetableId: number): Promise<ETimetable.WithItems> {
    return this.txHost.tx.timetable_timetable.findUniqueOrThrow({
      where: { id: timetableId },
      include: ETimetable.WithItems.include,
    })
  }

  async getLecturesByIds(ids: number[]): Promise<ELecture.Details[]> {
    return this.txHost.tx.subject_lecture.findMany({
      where: { id: { in: ids } },
      include: ELecture.Details.include,
    })
  }

  async lockUserTimetables(userId: number): Promise<void> {
    if (!this.txHost.isTransactionActive()) throw new Error('Timetable selections require a transaction')
    // Lock the owner before any timetable so creation, selection and deletion cannot race.
    await this.txHost.tx.$queryRaw`SELECT id FROM session_userprofile WHERE id = ${userId} FOR UPDATE`
  }

  async getHomeTimetable(userId: number, year: number, semester: number) {
    return this.txHost.withTransaction(async () => {
      await this.lockUserTimetables(userId)
      const timetable = await this.txHost.tx.timetable_timetable.findFirst({
        where: { user_id: userId, year, semester },
        orderBy: [{ is_main: 'desc' }, { arrange_order: 'asc' }, { id: 'asc' }],
      })
      if (!timetable || timetable.is_main) return timetable
      return this.txHost.tx.timetable_timetable.update({
        where: { id: timetable.id },
        data: { is_main: true },
      })
    })
  }

  async setHomeTimetable(userId: number, year: number, semester: number, timetableId: number) {
    return this.txHost.withTransaction(async () => {
      await this.lockUserTimetables(userId)
      await this.txHost.tx.timetable_timetable.updateMany({
        where: {
          user_id: userId, year, semester, is_main: true,
        },
        data: { is_main: false },
      })
      return this.txHost.tx.timetable_timetable.update({
        where: {
          id: timetableId, user_id: userId, year, semester,
        },
        data: { is_main: true },
      })
    })
  }

  async getSharedTimetableSelection(userId: number, year: number, semester: number) {
    return this.txHost.tx.timetable_timetable.findFirst({
      where: {
        user_id: userId, year, semester, is_shared: true,
      },
      select: { id: true },
    })
  }

  async setSharedTimetableSelection(userId: number, year: number, semester: number, timetableId: number | null) {
    return this.txHost.withTransaction(async () => {
      await this.lockUserTimetables(userId)
      await this.txHost.tx.timetable_timetable.updateMany({
        where: {
          user_id: userId, year, semester, is_shared: true,
        },
        data: { is_shared: false },
      })
      if (timetableId === null) return null
      return this.txHost.tx.timetable_timetable.update({
        where: {
          id: timetableId, user_id: userId, year, semester,
        },
        data: { is_shared: true },
      })
    })
  }

  async getSharedTimetables(userId: number, year: number, semester: number) {
    return this.txHost.tx.timetable_timetable.findMany({
      include: ETimetable.Details.include,
      where: {
        user_id: userId, year, semester, is_shared: true,
      },
    })
  }

  async getSharedTimetableWithItems(timetableId: number, userId: number) {
    return this.txHost.tx.timetable_timetable.findFirst({
      include: ETimetable.WithItems.include,
      where: { id: timetableId, user_id: userId, is_shared: true },
    })
  }

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
    return this.getTimetablesByUserId(user.id, year, semester, paginationAndSorting)
  }

  async getTimetablesByUserId(
    userId: number,
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

    return this.txHost.tx.timetable_timetable.findMany({
      include: ETimetable.Details.include,
      where: {
        year: year ?? undefined,
        semester: semester ?? undefined,
        user_id: userId,
      },
      skip,
      take,
      orderBy,
    })
  }

  async getTimetableBasics(
    user: session_userprofile,
    year?: number,
    semester?: number,
    paginationAndSorting?: {
      orderBy?: Prisma.timetable_timetableOrderByWithRelationInput
      skip?: number
      take?: number
    },
  ): Promise<ETimetable.Basic[]> {
    const skip = paginationAndSorting?.skip
    const take = paginationAndSorting?.take
    const orderBy = paginationAndSorting?.orderBy

    return this.txHost.tx.timetable_timetable.findMany({
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
    name?: string,
  ): Promise<ETimetable.Details> {
    return this.txHost.withTransaction(async () => {
      const home = await this.getHomeTimetable(user.id, year, semester)
      return this.txHost.tx.timetable_timetable.create({
        data: {
          user_id: user.id,
          year,
          semester,
          arrange_order: arrangeOrder,
          is_main: home === null,
          name: name ?? '',
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
    })
  }

  async getTimeTableBasicById(timeTableId: number) {
    return this.txHost.tx.timetable_timetable.findUniqueOrThrow({
      where: {
        id: timeTableId,
      },
    })
  }

  async addLectureToTimetable(timeTableId: number, lectureId: number) {
    return this.txHost.tx.timetable_timetable_lectures.create({
      data: {
        timetable_id: timeTableId,
        lecture_id: lectureId,
      },
    })
  }

  async getTimeTableById(timeTableId: number): Promise<ETimetable.Details> {
    return this.txHost.tx.timetable_timetable.findUniqueOrThrow({
      include: ETimetable.Details.include,
      where: {
        id: timeTableId,
      },
    })
  }

  async getTimeTableWithItemsByIdAndUserId(timeTableId: number, userId: number): Promise<ETimetable.WithItems | null> {
    return this.txHost.tx.timetable_timetable.findFirst({
      include: ETimetable.WithItems.include,
      where: { id: timeTableId, user_id: userId },
    })
  }

  async removeLectureFromTimetable(timeTableId: number, lectureId: number) {
    return this.txHost.tx.timetable_timetable_lectures.delete({
      where: {
        timetable_id_lecture_id: {
          timetable_id: timeTableId,
          lecture_id: lectureId,
        },
      },
    })
  }

  async deleteById(timetableId: number, userId: number) {
    return this.txHost.withTransaction(async () => {
      await this.lockUserTimetables(userId)
      await this.lockTimetable(timetableId)
      const { tx } = this.txHost
      await tx.timetable_timetable_lectures.deleteMany({
        where: { timetable_id: timetableId },
      })
      await tx.timetable_timetable_customblocks.deleteMany({
        where: { timetable_id: timetableId },
      })
      const deleted = await tx.timetable_timetable.delete({ where: { id: timetableId } })
      if (deleted.year !== null && deleted.semester !== null) {
        await this.getHomeTimetable(userId, deleted.year, deleted.semester)
      }
      return deleted
    })
  }

  async updateOrder(id: number, arrange_order: number): Promise<ETimetable.Basic> {
    return this.txHost.tx.timetable_timetable.update({
      where: {
        id,
      },
      data: {
        arrange_order,
      },
    })
  }

  async updateName(id: number, name: string): Promise<ETimetable.Basic> {
    return this.txHost.tx.timetable_timetable.update({
      where: { id },
      // trim name to remove leading and trailing spaces
      data: { name: name.trim() },
    })
  }

  async getLecturesWithClassTimes(timetableId: number) {
    return this.txHost.tx.timetable_timetable_lectures.findMany({
      where: { timetable_id: timetableId },
      include: ETimetable.WithLectureClasstimes.include,
    })
  }

  async getTimeTableLectures(timetableId: number): Promise<number[]> {
    return (
      await this.txHost.tx.timetable_timetable_lectures.findMany({
        where: { timetable_id: timetableId },
      })
    ).map((lecture) => lecture.lecture_id)
  }
}
