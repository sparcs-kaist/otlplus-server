import settings from "../src/settings";
import { PrismaService } from "../src/prisma/prisma.service";
import { Prisma, session_userprofile } from "@prisma/client";

const ormSettings = settings().ormconfig();

const prismaService = new PrismaService();

async function findReviewByUserTest(user: session_userprofile) {
  return await this.prisma.review_review.findMany({
    where: { writer_id: user.id },
    include: {
      course: {
        include: {
          subject_department: true,
          subject_course_professors: { include: { professor: true } },
          lecture: true,
          subject_courseuser: true,
        },
      },
      lecture: {
        include: {
          subject_department: true,
          subject_lecture_professors: { include: { professor: true } },
          subject_classtime: true,
          subject_examtime: true,
        },
      },
    }
  })
}



type ReviewDetails = Prisma.PromiseReturnType<typeof findReviewByUserTest>

