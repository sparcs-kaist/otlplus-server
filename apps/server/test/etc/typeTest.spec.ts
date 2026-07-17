import { Prisma, session_userprofile } from '@prisma/client'

const reviewByUserInclude = {
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
} satisfies Prisma.review_reviewInclude

function buildReviewByUserQuery(user: session_userprofile): Prisma.review_reviewFindManyArgs {
  return {
    where: { writer_id: user.id },
    include: reviewByUserInclude,
  }
}

type ReviewDetailsPayload = Prisma.review_reviewGetPayload<{
  include: typeof reviewByUserInclude
}>

async function findReviewByUserTest(user: session_userprofile): Promise<ReviewDetailsPayload[]> {
  buildReviewByUserQuery(user)
  return []
}

type ReviewDetails = Prisma.PromiseReturnType<typeof findReviewByUserTest>

function hasCourseDepartment(reviews: ReviewDetails): boolean {
  const firstReview = reviews[0]
  return firstReview?.course?.subject_department != null
}

it('compiles review payload typing without touching the database', () => {
  const payload: ReviewDetails = []
  expect(hasCourseDepartment(payload)).toBe(false)
})
