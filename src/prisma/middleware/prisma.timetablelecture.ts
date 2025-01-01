import { IPrismaMiddleware } from 'src/common/interfaces/IPrismaMiddleware';
import { PrismaService } from '../prisma.service';

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
    return true;
  }

  async postExecute(
    operations: IPrismaMiddleware.operationType,
    args: any,
    result: any,
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
        const res = await this.countNumPeople(lectureId);
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
        const res = await this.countNumPeopleBatch(lectures);
        if (!res) throw new Error('Could not increase num_people');
        return true;
      }
      throw new Error("can't find user");
    } else if (operations === 'delete') {
      const timetableId = args?.where?.timetable_id_lecture_id?.timetable_id; // todo : args에 where이 들거가나?
      const lectureId = args?.where?.timetable_id_lecture_id?.lecture_id;
      const userId: number | undefined = (
        await this.prisma.timetable_timetable.findUnique({
          where: { id: timetableId },
          select: { user_id: true },
        })
      )?.user_id;
      if (userId !== undefined) {
        const res = await this.countNumPeople(lectureId);
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
        const res = await this.countNumPeopleBatch(lectures);
        if (!res) throw new Error('Could not decrease num_people');
        return true;
      }
      throw new Error("can't find user");
    }
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
      });
    });
    return true;
  }

  private async countNumPeopleBatch(
    lectures: { id: number; timetable_id: number; lecture_id: number }[],
  ) {
    const lectureIds = lectures.map((lecture) => lecture.lecture_id);
    Promise.all(
      lectureIds.map(async (id) => {
        await this.prisma.$transaction(async (prisma) => {
          await prisma.subject_lecture.update({
            where: { id: id },
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
          });
        });
      }),
    );
    return true;
  }
}
