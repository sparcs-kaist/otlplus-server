import { Prisma } from '@prisma/client';
import { IPrismaMiddleware } from 'src/common/interfaces/IPrismaMiddleware';
import { PrismaService } from '../prisma.service';

export class TimetableLectureMiddleware
  implements IPrismaMiddleware.IPrismaMiddleware<true>
{
  private static instance: TimetableLectureMiddleware;

  constructor(private prisma: PrismaService) {}
  async execute(params: Prisma.MiddlewareParams): Promise<boolean> {
    if (params.action === 'create') {
      const timetableId = params.args.data.timetable_id;
      const lectureId = params.args.data.lecture_id;
      const userId: number | undefined = (
        await this.prisma.timetable_timetable.findUnique({
          where: { id: timetableId },
          select: { user_id: true },
        })
      )?.user_id;
      if (userId !== undefined) {
        const res = await this.increaseNumPeople(lectureId, userId);
        if (res) return true;
        throw new Error('Could not decrease num_people');
      }
      throw new Error("can't find user");
    } else if (params.action === 'delete') {
      const timetableId = params.args.where.timetable_id;
      const lectureId = params.args.where.lecture_id;
      const userId: number | undefined = (
        await this.prisma.timetable_timetable.findUnique({
          where: { id: timetableId },
          select: { user_id: true },
        })
      )?.user_id;
      if (userId !== undefined) {
        const res = await this.decreaseNumPeople(lectureId, userId);
        if (res) return true;
        throw new Error('Could not decrease num_people');
      }
      throw new Error("can't find user");
    } else if (params.action === 'deleteMany') {
      const timetableId = params.args.where.timetable_id;
      const lectures = await this.prisma.timetable_timetable_lectures.findMany({
        where: {
          timetable_id: timetableId,
        },
      });
      const userId: number | undefined = (
        await this.prisma.timetable_timetable.findUnique({
          where: { id: timetableId },
          select: { user_id: true },
        })
      )?.user_id;
      if (userId !== undefined) {
        for (const lecture of lectures) {
          const res = await this.decreaseNumPeople(lecture.lecture_id, userId);
          if (!res) throw new Error('Could not decrease num_people');
        }
        return true;
      }
    }
    return true;
  }

  public static getInstance(
    prisma: PrismaService,
  ): IPrismaMiddleware.IPrismaMiddleware<false> {
    if (!this.instance) {
      this.instance = new TimetableLectureMiddleware(prisma);
    }
    return this.instance;
  }

  private async increaseNumPeople(lectureId: number, userId: number) {
    const c = await this.prisma.timetable_timetable.count({
      where: {
        user_id: userId,
        timetable_timetable_lectures: {
          some: {
            lecture_id: lectureId,
          },
        },
      },
    });
    if (c == 0) {
      await this.prisma.subject_lecture.update({
        where: { id: lectureId },
        data: {
          num_people: {
            increment: 1,
          },
        },
      });
    }
    return true;
  }
  private async decreaseNumPeople(lectureId: number, userId: number) {
    const c = await this.prisma.timetable_timetable.count({
      where: {
        user_id: userId,
        timetable_timetable_lectures: {
          some: {
            lecture_id: lectureId,
          },
        },
      },
    });
    if (c == 1) {
      await this.prisma.subject_lecture.update({
        where: { id: lectureId },
        data: {
          num_people: {
            decrement: 1,
          },
        },
      });
    }
    return true;
  }
}
