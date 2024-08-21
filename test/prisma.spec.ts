import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TranManager } from '../src/prisma/transactionManager';
import { CourseRepository } from '../src/prisma/repositories/course.repository';
import { ECourse } from '@src/common/entities/ECourse';
import { CoursesService } from '@src/modules/courses/courses.service';
import { session_userprofile } from '@prisma/client';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('distinct count', async () => {
    const prisma = app.get(PrismaService);
    console.log('transaction test with tranManager');
    const result = await prisma.timetable_timetable.groupBy({
      by: ['user_id'],
      where: {
        timetable_timetable_lectures: {
          some: {
            lecture_id: 16155,
          },
        },
      },
      _count: {
        user_id: true,
      },
    });
    console.log(result);
  }, 10000);

  it('distinct count', async () => {
    const prisma = app.get(PrismaService);
    const result =
      (
        await prisma.timetable_timetable.findMany({
          distinct: ['user_id'],
          where: {
            timetable_timetable_lectures: {
              some: {
                lecture_id: 16155,
              },
            },
          },
        })
      )?.length ?? 0;
    console.log(result);
  });
});
