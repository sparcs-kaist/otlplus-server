import { IPrismaMiddleware } from 'src/common/interfaces/IPrismaMiddleware';
import { PrismaService } from '../prisma.service';

export class TimetableMiddleware
  implements IPrismaMiddleware.IPrismaMiddleware
{
  private static instance: TimetableMiddleware;
  private prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  async preExecute(
    operations: IPrismaMiddleware.operationType,
    args: any,
  ): Promise<boolean> {
    if (operations === 'delete') {
      const timetableId = args.where.id;
      const lectures = await this.prisma.timetable_timetable_lectures.findMany({
        where: {
          timetable_id: timetableId,
        },
      });
      const res = await this.decreaseNumPeopleBatch(lectures, timetableId);
      if (!res) throw new Error('Could not decrease num_people');
      return true;
    }
    return true;
  }

  async postExecute(): Promise<boolean> {
    return true;
  }

  static initialize(prisma: PrismaService) {
    if (!TimetableMiddleware.instance) {
      TimetableMiddleware.instance = new TimetableMiddleware(prisma);
    }
  }

  static getInstance(): TimetableMiddleware {
    return TimetableMiddleware.instance;
  }

  private async decreaseNumPeopleBatch(
    lectures: { lecture_id: number }[],
    userId: number,
  ) {
    const lectureIds = lectures.map((lecture) => lecture.lecture_id);
    const lectureCounts =
      await this.prisma.timetable_timetable_lectures.groupBy({
        by: ['lecture_id'],
        where: {
          lecture_id: {
            in: lectureIds,
          },
          timetable_timetable: {
            user_id: userId,
          },
        },
        _count: {
          lecture_id: true,
        },
      });
    const oneCountLeucters = lectureCounts
      .filter((count) => count._count.lecture_id === 1)
      .map((count) => count.lecture_id);
    await this.prisma.subject_lecture.updateMany({
      where: {
        id: {
          in: oneCountLeucters,
        },
      },
      data: {
        num_people: {
          decrement: 1,
        },
      },
    });
    return true;
  }
}
