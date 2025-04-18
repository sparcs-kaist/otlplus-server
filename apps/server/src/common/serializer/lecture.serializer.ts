import { ILecture } from '@otl/server-nest/common/interfaces'

import { applyOrder } from '@otl/common/utils'

import { ELecture } from '@otl/prisma-client/entities'

import { toJsonClasstime } from './classtime.serializer'
import { toJsonExamtime } from './examtime.serializer'
import { toJsonProfessors } from './professor.serializer'

export function toJsonLectureBasic(lecture: ELecture.Extended): ILecture.Basic {
  const professors = lecture.subject_lecture_professors.map((x) => x.professor)
  const ordered_professors = applyOrder(professors, ['professor_name'])

  return {
    id: lecture.id,
    title: lecture.title,
    title_en: lecture.title_en,
    course: lecture.course_id,
    old_old_code: lecture.old_code,
    old_code: lecture.new_code,
    class_no: lecture.class_no,
    year: lecture.year,
    semester: lecture.semester,
    code: lecture.code,
    department: lecture.department_id,
    department_code: lecture.subject_department.code,
    department_name: lecture.subject_department.name,
    department_name_en: lecture.subject_department.name_en ?? lecture.subject_department.name,
    type: lecture.type,
    type_en: lecture.type_en,
    limit: lecture.limit,
    num_people: lecture.num_people ?? 0,
    is_english: lecture.is_english,
    num_classes: lecture.num_classes,
    num_labs: lecture.num_labs,
    credit: lecture.credit,
    credit_au: lecture.credit_au,
    common_title: lecture.common_title ?? '',
    common_title_en: lecture.common_title_en ?? '',
    class_title: lecture.class_title ?? '',
    class_title_en: lecture.class_title_en ?? '',
    review_total_weight: lecture.review_total_weight + 0.000001,
    professors: toJsonProfessors(ordered_professors),
  }
}

export function toJsonLectureDetail(lecture: ELecture.Details): ILecture.Detail {
  const basic = toJsonLectureBasic(lecture)
  if (!ELecture.isDetails(lecture)) throw new Error('Lecture is not of type \'ELecture.Details\'')

  return Object.assign(basic, {
    grade: lecture.grade + 0.000001,
    load: lecture.load + 0.000001,
    speech: lecture.speech + 0.000001,
    classtimes: lecture.subject_classtime.map((classtime) => toJsonClasstime(classtime)),
    examtimes: lecture.subject_examtime.map((examtime) => toJsonExamtime(examtime)),
  })
}
