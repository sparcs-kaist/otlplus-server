import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { UserRepository } from "./repositories/user.repository";
import { LectureRepository } from "./repositories/lecture.repository";
import { ReviewsRepository } from "./repositories/review.repository";
import { DepartmentRepository } from "./repositories/department.repository";
import { CourseRepository } from "./repositories/course.repository";

@Module({
  providers: [PrismaService,
    UserRepository,
    LectureRepository,
    ReviewsRepository,
    DepartmentRepository,
    CourseRepository,
  ],
  exports: [PrismaService,
    UserRepository,
    LectureRepository,
    ReviewsRepository,
    DepartmentRepository,
    CourseRepository,
  ]
})
export class PrismaModule {}
