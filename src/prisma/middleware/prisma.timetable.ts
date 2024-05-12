import { Prisma } from '@prisma/client';
import { IPrismaMiddleware } from 'src/common/interfaces/IPrismaMiddleware';
import { PrismaService } from '../prisma.service';

export class TimetableMiddleware
  implements IPrismaMiddleware.IPrismaMiddleware<true>
{
  private static instance: TimetableMiddleware;
  constructor(private prisma: PrismaService) {}
  async execute(params: Prisma.MiddlewareParams): Promise<boolean> {
    if (params.action === 'delete') {
      const timetableId = params.args.where.id;
      const lectures = await this.prisma.timetable_timetable_lectures.findMany({
        where: {
          timetable_id: timetableId,
        },
      });
      for (const lecture of lectures) {
        const res = await this.decreaseNumPeople(
          lecture.lecture_id,
          timetableId,
        );
        if (!res) throw new Error('Could not decrease num_people');
      }
      return true;
    }
    return true;
  }

  public static getInstance(
    prisma: PrismaService,
  ): IPrismaMiddleware.IPrismaMiddleware<false> {
    if (!this.instance) {
      this.instance = new TimetableMiddleware(prisma);
    }
    return this.instance;
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
