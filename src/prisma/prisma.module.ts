import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { UserRepository } from "./repositories/user.repository";
import { LectureRepository } from "./repositories/lecture.repository";
import { ReviewRepository } from "./repositories/review.repository";
import { DepartmentRepository } from "./repositories/department.repository";
import { CourseRepository } from "./repositories/course.repository";
import { ProfessorRepository } from "./repositories/professor.repository";

@Module({
  providers: [PrismaService,
    UserRepository,
    LectureRepository,
    ReviewRepository,
    DepartmentRepository,
    CourseRepository,
    ProfessorRepository,
  ],
  exports: [PrismaService,
    UserRepository,
    LectureRepository,
    ReviewRepository,
    DepartmentRepository,
    CourseRepository,
    ProfessorRepository,
  ]
})
export class PrismaModule {}
