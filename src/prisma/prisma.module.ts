import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { UserRepository } from "./repositories/user.repository";
import { LectureRepository } from "./repositories/lecture.repository";
import { ReviewRepository } from "./repositories/review.repository";

@Module({
  providers: [PrismaService,
    UserRepository,
    LectureRepository,
    ReviewRepository],
  exports: [PrismaService,
    UserRepository,
    LectureRepository,
    ReviewRepository]
})
export class PrismaModule {}
