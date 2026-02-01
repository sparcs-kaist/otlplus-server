import { Prisma } from '@prisma/client'

export namespace ELectureV2 {
  const basicFileds = Prisma.validator<Prisma.subject_lectureSelect>()({
    id: true,
    course_id: true,
    class_no: true,
    title: true,
    title_en: true, // title -> name 으로 localize
    common_title: true,
    common_title_en: true,
    subject_department: {
      select: {
        id: true,
        name: true,
        name_en: true,
      },
    },
    type: true,
    type_en: true, // type, type_en -> type으로 localize
    limit: true,
    num_people: true,
    credit: true,
    credit_au: true,
    grade: true,
    load: true,
    speech: true,
    is_english: true,
    num_classes: true,
    num_labs: true,
  })

  export const BasicArgs = Prisma.validator<Prisma.subject_lectureDefaultArgs>()({
    select: basicFileds,
  })
  export type Basic = Prisma.subject_lectureGetPayload<typeof BasicArgs>

  // classTime : (강의 시간)
  const classTimeFileds = Prisma.validator<Prisma.subject_classtimeSelect>()({
    day: true,
    begin: true,
    end: true,
    building_id: true,
    building_full_name: true,
    building_full_name_en: true,
    room_name: true,
  })

  export const ClassTimeArgs = Prisma.validator<Prisma.subject_classtimeDefaultArgs>()({
    select: classTimeFileds,
  })
  export type ClassTime = Prisma.subject_classtimeGetPayload<typeof ClassTimeArgs>

  // examTime : (시험 시간)
  const examTimeFiles = Prisma.validator<Prisma.subject_examtimeSelect>()({
    day: true,
    begin: true,
    end: true,
  })

  export const ExamTimeArgs = Prisma.validator<Prisma.subject_examtimeDefaultArgs>()({
    select: examTimeFiles,
  })
  export type ExamTime = Prisma.subject_examtimeGetPayload<typeof ExamTimeArgs>
}
