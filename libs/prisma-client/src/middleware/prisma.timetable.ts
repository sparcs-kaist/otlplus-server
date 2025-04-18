import { PrismaService } from '@otl/prisma-client/prisma.service'

import { IPrismaMiddleware } from './IPrismaMiddleware'

export class TimetableMiddleware implements IPrismaMiddleware.Middleware {
  private static instance: TimetableMiddleware

  private prisma: PrismaService

  constructor(prisma: PrismaService) {
    this.prisma = prisma
  }

  async preExecute(_operations: IPrismaMiddleware.operationType, _args: any): Promise<boolean> {
    return true
  }

  async postExecute(operations: IPrismaMiddleware.operationType, args: any, _result: any): Promise<boolean> {
    if (operations === 'delete') {
      const timetableId = args.where.id
      const lectures = await this.prisma.timetable_timetable_lectures.findMany({
        where: {
          timetable_id: timetableId,
        },
      })
      const res = await this.countNumPeopleBatch(lectures)
      if (!res) throw new Error('Could not decrease num_people')
      return true
    }
    return true
  }

  static initialize(prisma: PrismaService) {
    if (!TimetableMiddleware.instance) {
      TimetableMiddleware.instance = new TimetableMiddleware(prisma)
    }
  }

  static getInstance(): TimetableMiddleware {
    return TimetableMiddleware.instance
  }

  private async countNumPeopleBatch(lectures: { id: number, timetable_id: number, lecture_id: number }[]) {
    const lectureIds = lectures.map((lecture) => lecture.lecture_id)
    Promise.all(
      lectureIds.map(async (id) => {
        const numPeople = (
          await this.prisma.timetable_timetable.findMany({
            distinct: ['user_id'],
            where: {
              timetable_timetable_lectures: {
                some: {
                  lecture_id: id,
                },
              },
            },
          })
        )?.length ?? 0
        await this.prisma.subject_lecture.update({
          where: { id },
          data: {
            num_people: numPeople,
          },
        })
      }),
    )
    return true
  }
}
