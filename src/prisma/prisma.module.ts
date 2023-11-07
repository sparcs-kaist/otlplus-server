import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CourseRepository } from './repositories/course.repository';
import { DepartmentRepository } from './repositories/department.repository';
import { LectureRepository } from './repositories/lecture.repository';
import { ReviewsRepository } from './repositories/review.repository';
import { SemesterRepository } from './repositories/semester.repository';
import { TimetableRepository } from './repositories/timetable.repository';
import { UserRepository } from './repositories/user.repository';

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
  ],
})
export class PrismaModule {}
