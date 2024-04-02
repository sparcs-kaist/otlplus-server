import { Module } from '@nestjs/common';
import { ReviewMiddleware } from './middleware/prisma.reviews';
import { PrismaService } from './prisma.service';
import { CourseRepository } from './repositories/course.repository';
import { DepartmentRepository } from './repositories/department.repository';
import { LectureRepository } from './repositories/lecture.repository';
import { NoticesRepository } from './repositories/notices.repository';
import { PlannerRepository } from './repositories/planner.repository';
import { ReviewsRepository } from './repositories/review.repository';
import { SemesterRepository } from './repositories/semester.repository';
import { TimetableRepository } from './repositories/timetable.repository';
import { TracksRepository } from './repositories/track.repository';
import { UserRepository } from './repositories/user.repository';
import { WishlistRepository } from './repositories/wishlist.repository';

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
    ReviewMiddleware,
  ],
})
export class PrismaModule {}
