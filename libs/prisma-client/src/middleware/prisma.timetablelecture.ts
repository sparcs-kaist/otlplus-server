import { Prisma } from '@prisma/client'

import { PrismaService } from '@otl/prisma-client/prisma.service'

import { IPrismaMiddleware } from './IPrismaMiddleware'

export class TimetableLectureMiddleware implements IPrismaMiddleware.Middleware {
  private static instance: TimetableLectureMiddleware

  private prisma: PrismaService

  constructor(prisma: PrismaService) {
    this.prisma = prisma
  }

  async preExecute(_operations: IPrismaMiddleware.operationType, _args: unknown): Promise<boolean> {
    return true
  }

  async postExecute(operations: IPrismaMiddleware.operationType, args: unknown, _result: unknown): Promise<boolean> {
    if (operations === 'create') {
      const { data } = args as Prisma.timetable_timetable_lecturesCreateArgs
      const timetableId = 'timetable_id' in data ? data.timetable_id : data.timetable_timetable?.connect?.id
      const lectureId = 'lecture_id' in data ? data.lecture_id : data.subject_lecture?.connect?.id
      if (lectureId === undefined) throw new Error('Missing lecture ID')
      const userId: number | undefined = (
        await this.prisma.timetable_timetable.findUnique({
          where: { id: timetableId },
          select: { user_id: true },
        })
      )?.user_id
      if (userId !== undefined) {
        const res = await this.countNumPeople(lectureId)
        if (res) return true
        throw new Error('Could not decrease num_people')
      }
      throw new Error('can\'t find user')
    }
    else if (operations === 'createMany') {
      const { data } = args as Prisma.timetable_timetable_lecturesCreateManyArgs
      const lectures = Array.isArray(data) ? data : [data]
      return this.countNumPeopleBatch(lectures)
    }
    else if (operations === 'delete') {
      const { where } = args as Prisma.timetable_timetable_lecturesDeleteArgs
      const timetableId = where.timetable_id_lecture_id?.timetable_id // todo : args에 where이 들거가나?
      const lectureId = where.timetable_id_lecture_id?.lecture_id
      if (lectureId === undefined) throw new Error('Missing lecture ID')
      const userId: number | undefined = (
        await this.prisma.timetable_timetable.findUnique({
          where: { id: timetableId },
          select: { user_id: true },
        })
      )?.user_id
      if (userId !== undefined) {
        const res = await this.countNumPeople(lectureId)
        if (res) return true
        throw new Error('Could not decrease num_people')
      }
      throw new Error('can\'t find user')
    }
    else if (operations === 'deleteMany') {
      const { where } = args as Prisma.timetable_timetable_lecturesDeleteManyArgs
      const timetableId = where?.timetable_id
      if (typeof timetableId !== 'number') throw new Error('Expected a single timetable ID')
      const lectures = await this.prisma.timetable_timetable_lectures.findMany({
        where: {
          timetable_id: timetableId,
        },
      })
      const userId: number | undefined = (
        await this.prisma.timetable_timetable.findUnique({
          where: { id: timetableId },
          select: { user_id: true },
        })
      )?.user_id
      if (userId !== undefined) {
        const res = await this.countNumPeopleBatch(lectures)
        if (!res) throw new Error('Could not decrease num_people')
        return true
      }
      throw new Error('can\'t find user')
    }
    return true
  }

  static initialize(prisma: PrismaService) {
    if (!TimetableLectureMiddleware.instance) {
      TimetableLectureMiddleware.instance = new TimetableLectureMiddleware(prisma)
    }
  }

  static getInstance(): TimetableLectureMiddleware {
    return TimetableLectureMiddleware.instance
  }

  private async countNumPeople(lectureId: number) {
    await this.prisma.$transaction(async (prisma) => {
      await prisma.subject_lecture.update({
        where: { id: lectureId },
        data: {
          num_people:
            (
              await prisma.timetable_timetable.findMany({
                distinct: ['user_id'],
                where: {
                  timetable_timetable_lectures: {
                    some: {
                      lecture_id: lectureId,
                    },
                  },
                },
              })
            )?.length ?? 0,
        },
      })
    })
    return true
  }

  private async countNumPeopleBatch(lectures: { lecture_id: number }[]) {
    const lectureIds = lectures.map((lecture) => lecture.lecture_id)
    Promise.all(
      lectureIds.map(async (id) => {
        await this.prisma.$transaction(async (prisma) => {
          await prisma.subject_lecture.update({
            where: { id },
            data: {
              num_people:
                (
                  await prisma.timetable_timetable.findMany({
                    distinct: ['user_id'],
                    where: {
                      timetable_timetable_lectures: {
                        some: {
                          lecture_id: id,
                        },
                      },
                    },
                  })
                )?.length ?? 0,
            },
          })
        })
      }),
    )
    return true
  }
}
