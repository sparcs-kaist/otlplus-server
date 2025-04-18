import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { session_userprofile } from '@prisma/client';
import { CoursesService } from '@otl/server-nest/modules/courses/courses.service';
import { AppModule } from '../src/app.module';
import { CourseRepository } from '@otl/prisma-client/repositories';
import { TranManager } from '@otl/prisma-client/transactionManager';
import { PrismaService } from '@otl/prisma-client/prisma.service';
import { ECourse } from '@otl/prisma-client/entities';

describe.skip('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('tranManager', async () => {
    const courseRepository = app.get(CourseRepository);
    console.log('transaction test with tranManager');

    await TranManager.transaction(async () => {
      await courseRepository.getCourseById(10);
      await courseRepository.getCourseById(11);
    });
  }, 10000);

  it('tranManager multi request', async () => {
    const courseRepository = app.get(CourseRepository);
    console.log('transaction test with tranManager, multi request');

    await Promise.all([
      TranManager.transaction(async () => {
        console.log('batch 1');
        await courseRepository.getCourseById(10);
        await courseRepository.getCourseById(11);
      }),
      TranManager.transaction(async () => {
        console.log('batch 2');
        await courseRepository.getCourseById(12);
        await courseRepository.getCourseById(13);
        throw Error('test error');
      }),
    ]);
  }, 10000);

  it('TranManager multi request, propagation', async () => {
    const courseRepository = app.get(CourseRepository);
    console.log('transaction test with tranManager, multi request propagation');
    const prisma = app.get(PrismaService);
    await Promise.all([
      TranManager.transaction(async () => {
        console.log('batch 1');
        await TranManager.getTx().subject_course.findFirst({
          where: {
            id: 10,
          },
        });
        console.log(TranManager.getTx());
        await TranManager.getTx().subject_course.findFirst({
          where: {
            id: 11,
          },
        });
        console.log(TranManager.getTx());
      }),
      TranManager.transaction(async () => {
        console.log('batch 2');
        await TranManager.getTx().subject_course.findFirst({
          where: {
            id: 12,
          },
        });
        console.log(TranManager.getTx());

        await TranManager.getTx().subject_course.findFirst({
          where: {
            id: 13,
          },
        });
        console.log(TranManager.getTx());

        throw Error('test error');
      }),
    ]);
  });

  it('$transaction', async () => {
    console.log('transaction test with prismaService');
    const prismaService = app.get(PrismaService);
    await prismaService.$transaction(async (tx) => {
      await tx.subject_course.findUnique({
        include: ECourse.Details.include,
        where: {
          id: 10,
        },
      });
      await tx.subject_course.findUnique({
        include: ECourse.Details.include,
        where: {
          id: 11,
        },
      });
    });
  }, 10000);

  it('transaction test with cls', async () => {
    console.log('transaction test with cls');
    const prismaService = app.get(PrismaService);
    const coursesService = app.get(CoursesService);
    const user: session_userprofile = (await prismaService.session_userprofile.findUnique({
      where: {
        id: 13933,
      },
    })) as session_userprofile;
    const courses = await coursesService.getCourses({ keyword: '기계' }, user);
  });

  it('transaction test with cls, multi request', async () => {
    console.log('transaction test with cls, multi request');
    const prismaService = app.get(PrismaService);
    const coursesService = app.get(CoursesService);
    const user: session_userprofile = (await prismaService.session_userprofile.findUnique({
      where: {
        id: 13933,
      },
    })) as session_userprofile;
    await Promise.all([coursesService.getCourseByIds([10, 11], user), coursesService.getCourseByIds([12, 13], user)]);
  });
});
