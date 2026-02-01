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

  const courseDetailSelect = Prisma.validator<Prisma.subject_courseSelect>()({
    id: true,
    title: true,
    title_en: true,
    new_code: true,
    type: true,
    type_en: true,
    summury: true,
  })

  export const CourseDetailArgs = Prisma.validator<Prisma.subject_courseDefaultArgs>()({
    select: {
      ...courseDetailSelect,
      subject_department: {
        select: {
          id: true,
          name: true,
          name_en: true,
        },
      },
    },
  })

  export type CourseDetail = Prisma.subject_courseGetPayload<typeof CourseDetailArgs>

  // Course에 속한 lecture에 대한 타입
  const courseNestedLecturesSelect = Prisma.validator<Prisma.subject_lectureSelect>()({
    id: true,
    title: true,
    title_en: true,
    common_title: true,
    common_title_en: true,
    year: true,
    semester: true,
    class_no: true,
    num_classes: true,
    num_labs: true,
    credit: true,
    credit_au: true,
    subject_lecture_professors: {
      select: {
        professor_id: true,
      },
    },
  })

  export const courseNestedLecturesArgs = Prisma.validator<Prisma.subject_courseDefaultArgs>()({
    select: courseNestedLecturesSelect,
  })

  export type CourseNestedLectures = Prisma.subject_lectureGetPayload<typeof courseNestedLecturesArgs>
}
