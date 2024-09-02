import { Module, OnModuleInit } from '@nestjs/common';
import { CourseMiddleware } from './middleware/prisma.course';
import { DepartmentMiddleware } from './middleware/prisma.department';
import { LectureMiddleware } from './middleware/prisma.lecture';
import { LectureProfessorsMiddleware } from './middleware/prisma.lectureprofessors';
import { ReviewMiddleware } from './middleware/prisma.reviews';
import { ReviewVoteMiddleware } from './middleware/prisma.reviewvote';
import { SemesterMiddleware } from './middleware/prisma.semester';
import { TimetableMiddleware } from './middleware/prisma.timetable';
import { TimetableLectureMiddleware } from './middleware/prisma.timetablelecture';
import { PrismaService } from './prisma.service';
import { CourseRepository } from './repositories/course.repository';
import { DepartmentRepository } from './repositories/department.repository';
import { LectureRepository } from './repositories/lecture.repository';
import { NoticesRepository } from './repositories/notices.repository';
import { PlannerRepository } from './repositories/planner.repository';
import { ReviewsRepository } from './repositories/review.repository';
import { SemesterRepository } from './repositories/semester.repository';
import { SyncRepository } from './repositories/sync.repository';
import { TimetableRepository } from './repositories/timetable.repository';
import { TracksRepository } from './repositories/track.repository';
import { UserRepository } from './repositories/user.repository';
import { WishlistRepository } from './repositories/wishlist.repository';
import { TranManager } from './transactionManager';

// const extendPrismaClient = {
//   provide: PrismaService,
//   useFactory: () => {
//     const prisma = new PrismaService()
//     console.log("prisma instance created");
//     return prisma;
//   },
// };

@Module({
  providers: [
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
    ReviewMiddleware,
    TranManager,
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
    SyncRepository,
  ],
})
export class PrismaModule implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}
  onModuleInit() {
    CourseMiddleware.initialize(this.prisma);
    DepartmentMiddleware.initialize(this.prisma);
    LectureMiddleware.initialize(this.prisma);
    LectureProfessorsMiddleware.initialize(this.prisma);
    ReviewMiddleware.initialize(this.prisma);
    ReviewVoteMiddleware.initialize(this.prisma);
    SemesterMiddleware.initialize(this.prisma);
    TimetableMiddleware.initialize(this.prisma);
    TimetableLectureMiddleware.initialize(this.prisma);
  }
}
