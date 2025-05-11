import {
  DynamicModule, Global, Module, OnModuleInit,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { CourseMiddleware } from '@otl/prisma-client/middleware/prisma.course'
import { DepartmentMiddleware } from '@otl/prisma-client/middleware/prisma.department'
import { LectureMiddleware } from '@otl/prisma-client/middleware/prisma.lecture'
import { LectureProfessorsMiddleware } from '@otl/prisma-client/middleware/prisma.lectureprofessors'
import { ReviewMiddleware } from '@otl/prisma-client/middleware/prisma.reviews'
import { ReviewVoteMiddleware } from '@otl/prisma-client/middleware/prisma.reviewvote'
import { SemesterMiddleware } from '@otl/prisma-client/middleware/prisma.semester'
import { TimetableMiddleware } from '@otl/prisma-client/middleware/prisma.timetable'
import { TimetableLectureMiddleware } from '@otl/prisma-client/middleware/prisma.timetablelecture'
import { PrismaService } from '@otl/prisma-client/prisma.service'
import {
  CourseRepository,
  DepartmentRepository,
  LectureRepository,
  NoticesRepository,
  PlannerRepository,
  ReviewsRepository,
  SemesterRepository,
  SyncRepository,
  TimetableRepository,
  TracksRepository,
  UserRepository,
  WishlistRepository,
} from '@otl/prisma-client/repositories'
import { NotificationPrismaRepository } from '@otl/prisma-client/repositories/notification.repository'

@Module({})
@Global()
export class PrismaModule implements OnModuleInit {
  static register(ormOptions: Prisma.PrismaClientOptions): DynamicModule {
    return {
      module: PrismaModule,
      providers: [
        {
          provide: 'ORM_OPTIONS',
          useValue: ormOptions,
        },
        PrismaService,
        UserRepository,
        LectureRepository,
        ReviewsRepository,
        DepartmentRepository,
        CourseRepository,
        SemesterRepository,
        TimetableRepository,
        WishlistRepository,
        PlannerRepository,
        TracksRepository,
        NoticesRepository,
        SyncRepository,
        NotificationPrismaRepository,
        ReviewMiddleware,
      ],
      exports: [
        PrismaService,
        UserRepository,
        LectureRepository,
        ReviewsRepository,
        DepartmentRepository,
        CourseRepository,
        SemesterRepository,
        TimetableRepository,
        WishlistRepository,
        PlannerRepository,
        TracksRepository,
        NoticesRepository,
        NotificationPrismaRepository,
        SyncRepository,
      ],
    }
  }

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    CourseMiddleware.initialize(this.prisma)
    DepartmentMiddleware.initialize(this.prisma)
    LectureMiddleware.initialize(this.prisma)
    LectureProfessorsMiddleware.initialize(this.prisma)
    ReviewMiddleware.initialize(this.prisma)
    ReviewVoteMiddleware.initialize(this.prisma)
    SemesterMiddleware.initialize(this.prisma)
    TimetableMiddleware.initialize(this.prisma)
    TimetableLectureMiddleware.initialize(this.prisma)
  }
}
