import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ELecture } from '@otl/common/entities/ELecture';
import { applyOffset, applyOrder } from '@otl/server-nest/common/utils/search.utils';
import { LectureRepository } from '../../prisma/src/repositories/lecture.repository';
import { AppModule } from '../src/app.module';
import { PrismaService } from '@otl/server-nest/modules/prisma/prisma.service';
import { CourseRepository } from '../../prisma/src/repositories/course.repository';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // it('distinct count', async () => {
  //   const prisma = app.get(PrismaService);
  //   console.log('transaction test with tranManager');
  //   const result = await prisma.timetable_timetable.groupBy({
  //     by: ['user_id'],
  //     where: {
  //       timetable_timetable_lectures: {
  //         some: {
  //           lecture_id: 16155,
  //         },
  //       },
  //     },
  //     _count: {
  //       user_id: true,
  //     },
  //   });
  //   console.log(result);
  // }, 10000);

  // it('distinct count', async () => {
  //   const prisma = app.get(PrismaService);
  //   const result =
  //     (
  //       await prisma.timetable_timetable.findMany({
  //         distinct: ['user_id'],
  //         where: {
  //           timetable_timetable_lectures: {
  //             some: {
  //               lecture_id: 16155,
  //             },
  //           },
  //         },
  //       })
  //     )?.length ?? 0;
  //   console.log(result);
  // });

  it('join three table', async () => {
    const lectureRepo = app.get(LectureRepository);
    const courseRepo = app.get(CourseRepository);
    const prisma = app.get(PrismaService);
    const DEFAULT_LIMIT = 300;
    const DEFAULT_ORDER = ['year', 'semester', 'old_code', 'class_no'];
    const researchTypes = ['Individual Study', 'Thesis Study(Undergraduate)', 'Thesis Research(MA/phD)'];

    const semesterFilter = lectureRepo.semesterFilter(2024, 3);
    const timeFilter = lectureRepo.timeFilter(0, 5, 13);
    // const begin = new Date().setHours(10, 30, 0, 0);
    // const end = new Date().setHours(14, 30, 0, 0);
    // const timeFilter = {
    //   subject_classtime: {
    //     some:
    //       {
    //         day: 0,
    //         begin: {
    //           gte: set(new Date(), { hours: 10, minutes: 30 })
    //         },
    //         end: {
    //           lte: set(new Date(), { hours: 14, minutes: 30 })
    //         }
    //       }
    //   }
    // };
    const departmentFilter = courseRepo.departmentFilter(['CS']);
    const typeFilter = courseRepo.typeFilter(['ME']);
    const groupFilter = courseRepo.groupFilter(undefined);
    const keywordFilter = courseRepo.keywordFilter(undefined, false);
    const defaultFilter = {
      AND: [
        {
          deleted: false,
        },
        {
          type_en: {
            notIn: researchTypes,
          },
        },
      ],
    };

    const filters: object[] = [
      semesterFilter,
      timeFilter,
      departmentFilter,
      typeFilter,
      groupFilter,
      keywordFilter,
      defaultFilter,
    ].filter((filter): filter is object => filter !== null);

    const options = {
      include: {
        subject_department: true,
        subject_lecture_professors: { include: { professor: true } },
        subject_classtime: true,
        subject_examtime: true,
      },
      where: {
        AND: filters,
      },
      take: DEFAULT_LIMIT,
    };
    const queryResult = await prisma.subject_lecture.findMany(options);
    const levelFilteredResult = courseRepo.levelFilter<ELecture.Details>(queryResult, ['ALL']);
    const order = ['old_code', 'class_no'];
    const orderedQuery = applyOrder<ELecture.Details>(
      levelFilteredResult,
      (order ?? DEFAULT_ORDER) as (keyof ELecture.Details)[],
    );
    const result = applyOffset<ELecture.Details>(orderedQuery, 0);
  });

  // it("select classtime", async () => {
  //   const prisma = app.get(PrismaService);
  //   const result1 = await prisma.subject_classtime.findMany({
  //     where:{
  //       day: 0
  //     }
  //   })
  //   console.log(result1)
  //   const result = await prisma.subject_classtime.findMany({
  //     where: {
  //       day: 0,
  //       begin: {
  //         gte: new Date('1970-01-01T10:30:00.000Z')
  //       },
  //       end: {
  //         lte: new Date('1970-01-01T14:30:00.000Z')
  //       }
  //     }
  //   });
  //   console.log(result.length);
  //
  // })
});
