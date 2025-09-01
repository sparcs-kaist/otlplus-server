import { Prisma } from '@prisma/client'

export namespace ECourse {
  export const Basic = Prisma.validator<Prisma.subject_courseDefaultArgs>()({})
  export type Basic = Prisma.subject_courseGetPayload<typeof Basic>

  export const Extended = Prisma.validator<Prisma.subject_courseDefaultArgs>()({
    include: {
      subject_department: true,
      subject_course_professors: { include: { professor: true } },
    },
  })
  export type Extended = Prisma.subject_courseGetPayload<typeof Extended>

  export const ExtendedWithIsRead = Prisma.validator<Prisma.subject_courseDefaultArgs>()({
    include: {
      ...Extended.include,
      subject_courseuser: true,
    },
  })
  export type ExtendedWithIsRead = Prisma.subject_courseGetPayload<typeof ExtendedWithIsRead>

  export const Details = Prisma.validator<Prisma.subject_courseDefaultArgs>()({
    include: {
      ...Extended.include,
    },
  })
  export type Details = Prisma.subject_courseGetPayload<typeof Details>

  export const DetailWithIsRead = Prisma.validator<Prisma.subject_courseDefaultArgs>()({
    include: {
      ...Details.include,
      subject_courseuser: true,
    },
  })
  export type DetailWithIsRead = Prisma.subject_courseGetPayload<typeof DetailWithIsRead>

  export namespace ECourseUser {
    // eslint-disable-next-line no-shadow
    export type Basic = Prisma.subject_courseuserGetPayload<Prisma.subject_courseuserDefaultArgs>
  }
}
