import { IPrismaMiddleware } from 'src/common/interfaces/IPrismaMiddleware';
import { PrismaService } from '../prisma.service';

interface UserCount {
  [lecture_id: number]: Set<number>;
}

export class TimetableLectureMiddleware
  implements IPrismaMiddleware.IPrismaMiddleware
{
  private static instance: TimetableLectureMiddleware;
  private prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  async preExecute(
    operations: IPrismaMiddleware.operationType,
    args: any,
  ): Promise<boolean> {
    if (operations === 'create') {
      const timetableId = args?.data?.timetable_id;
      const lectureId = args?.data?.lecture_id;
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
    } else if (operations === 'createMany') {
      const timetableId = args?.data?.timetable_id;
      const lectures = args?.data; // nested createMany 에 대해서는 작동 안함.
      const userId: number | undefined = (
        await this.prisma.timetable_timetable.findUnique({
          where: { id: timetableId },
          select: { user_id: true },
        })
      )?.user_id;
      if (userId !== undefined) {
        const res = await this.increaseNumPeopleBatch(lectures, userId);
        if (!res) throw new Error('Could not increase num_people');
        return true;
      }
      throw new Error("can't find user");
    } else if (operations === 'delete') {
      const timetableId = args?.where?.timetable_id; // todo : args에 where이 들거가나?
      const lectureId = args?.where?.lecture_id;
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
    } else if (operations === 'deleteMany') {
      const timetableId = args?.where?.timetable_id;
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
        const res = await this.decreaseNumPeopleBatch(lectures, userId);
        if (!res) throw new Error('Could not decrease num_people');
        return true;
      }
      throw new Error("can't find user");
    }
    return true;
  }

  async postExecute(): Promise<boolean> {
    return true;
  }

  static initialize(prisma: PrismaService) {
    if (!TimetableLectureMiddleware.instance) {
      TimetableLectureMiddleware.instance = new TimetableLectureMiddleware(
        prisma,
      );
    }
  }

  static getInstance(): TimetableLectureMiddleware {
    return TimetableLectureMiddleware.instance;
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
    const count = await this.prisma.timetable_timetable.count({
      distinct: ['user_id'],
      where: {
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
          num_people: count + 1,
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
    const count = await this.prisma.timetable_timetable.count({
      distinct: ['user_id'],
      where: {
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
          num_people: count - 1,
        },
      });
    }
    return true;
  }

  private async increaseNumPeopleBatch(
    lectures: { id: number; lecture_id: number }[],
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
      .filter((count) => count._count.lecture_id === 0)
      .map((count) => count.lecture_id);
    const numPeople = await this.getNumpeople(oneCountLectures);
    Promise.all(
      numPeople.map(async (count) => {
        await this.prisma.subject_lecture.update({
          where: {
            id: count.lectureId,
          },
          data: {
            num_people: count.userCount + 1,
          },
        });
      }),
    );
    return true;
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
