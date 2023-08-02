import { Prisma } from "@prisma/client";

export type userSelectResultType = Prisma.session_userprofileGetPayload<{
  include: Prisma.session_userprofileInclude
}>

export type courseSelectResultType = Prisma.subject_courseGetPayload<{
  include: Prisma.subject_courseInclude
}>

const courseDetails = Prisma.validator<Prisma.subject_courseArgs>()({
  include: {
    subject_department: true,
    subject_course_professors: { include: { professor: true } },
    lecture: true,
    subject_courseuser: true
  }
});

const lectureDetails = Prisma.validator<Prisma.subject_lectureArgs>()({
  include: {
    subject_department: true,
    subject_lecture_professors: { include: { professor: true } },
    subject_classtime: true,
    subject_examtime: true
  }
});

export type NESTED = true;


const reviewDetails = Prisma.validator<Prisma.review_reviewArgs>()({
  include: {
    course: courseDetails,
    lecture: lectureDetails
  }
});

export type ReviewDetails = Prisma.review_reviewGetPayload<typeof reviewDetails>
export type LectureDetails = Prisma.subject_lectureGetPayload<typeof lectureDetails>
export type CourseDetails = Prisma.subject_courseGetPayload<typeof courseDetails>