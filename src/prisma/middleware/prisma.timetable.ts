import { IPrismaMiddleware } from 'src/common/interfaces/IPrismaMiddleware';
import { PrismaService } from '../prisma.service';
interface UserCount {
  [lecture_id: number]: Set<number>;
}
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
    const oneCountLectures = lectureCounts
      .filter((count) => count._count.lecture_id === 1)
      .map((count) => count.lecture_id);
    const numPeople = await this.getNumpeople(oneCountLectures);
    Promise.all(
      numPeople.map(async (count) => {
        await this.prisma.subject_lecture.update({
          where: {
            id: count.lectureId,
          },
          data: {
            num_people: count.userCount - 1,
          },
        });
      }),
    );
    return true;
  }

  async getNumpeople(lectureIds: number[]) {
    const timetables = await this.prisma.timetable_timetable_lectures.findMany({
      where: {
        lecture_id: {
          in: lectureIds,
        },
      },
      include: {
        timetable_timetable: true,
      },
    });
    const userCount: UserCount = timetables.reduce((acc, t) => {
      const { lecture_id, timetable_timetable } = t;
      if (!acc[lecture_id]) {
        acc[lecture_id] = new Set();
      }
      acc[lecture_id].add(timetable_timetable.user_id);
      return acc;
    }, {} as UserCount);

    return Object.keys(userCount).map((lecture_id) => {
      const lectureId = Number(lecture_id);
      return {
        lectureId: lectureId,
        userCount: userCount[lectureId].size,
      };
    });
  }
}
