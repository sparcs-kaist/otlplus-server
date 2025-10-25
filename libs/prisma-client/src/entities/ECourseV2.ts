import { Prisma } from '@prisma/client'

export namespace ECourseV2 {
  const basicFileds = Prisma.validator<Prisma.subject_courseSelect>()({
    id: true,
    department_id: true,
    type: true,
    type_en: true,
    title: true,
    title_en: true,
    summury: true,
    new_code: true,
    level: true,
  })

  export const BasicArgs = Prisma.validator<Prisma.subject_courseDefaultArgs>()({
    select: basicFileds,
  })
  export type Basic = Prisma.subject_courseGetPayload<typeof BasicArgs>

  export const BasicWithProfessorsArgs = Prisma.validator<Prisma.subject_courseDefaultArgs>()({
    select: {
      ...basicFileds,
      subject_department: {
        select: {
          id: true,
          name: true,
          name_en: true,
        },
      },
      subject_course_professors: {
        select: {
          professor: {
            select: {
              id: true,
              professor_name: true,
              professor_name_en: true,
            },
          },
        },
      },
    },
  })
  export type BasicWithProfessors = Prisma.subject_courseGetPayload<typeof BasicWithProfessorsArgs>
}
