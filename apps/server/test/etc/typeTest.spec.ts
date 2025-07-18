import { Prisma, session_userprofile } from '@prisma/client'

import { PrismaService } from '@otl/prisma-client/prisma.service'

import settings from '@otl/server-nest/settings'

const ormSettings = settings().ormconfig()

const prismaService = new PrismaService(ormSettings)

async function findReviewByUserTest(user: session_userprofile) {
  return await prismaService.review_review.findMany({
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
    },
  })
}

type ReviewDetails = Prisma.PromiseReturnType<typeof findReviewByUserTest>
