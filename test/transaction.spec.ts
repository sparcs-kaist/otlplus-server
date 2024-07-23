import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TranManager } from '../src/prisma/transactionManager';
import { CourseRepository } from '../src/prisma/repositories/course.repository';
import { ECourse } from '@src/common/entities/ECourse';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/session/info (GET)', async () => {
    const courseRepository = app.get(CourseRepository);

    await TranManager.transaction(async () => {
      await courseRepository.getCourseById(10);
      await courseRepository.getCourseById(11);
    });
  }, 10000);

  it('$transaction', async () => {
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
});
