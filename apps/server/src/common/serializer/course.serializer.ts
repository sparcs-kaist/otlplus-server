import { ICourse, IProfessor } from '@otl/server-nest/common/interfaces'
import { subject_course, subject_lecture, subject_professor } from '@prisma/client'

import { applyOrder } from '@otl/common/utils/util'

import { ECourse } from '@otl/prisma-client/entities'

import { toJsonDepartment } from './department.serializer'
import { toJsonProfessors } from './professor.serializer'

export function toJsonFeedBasic(course: subject_course): ICourse.FeedBasic {
  return {
    id: course.id,
    old_code: course.new_code,
    department_id: course.department_id,
    type: course.type,
    type_en: course.type_en,
    title: course.title,
    title_en: course.title_en,
    summary: course.summury,
    grade_sum: course.grade_sum + 0.00001,
    load_sum: course.load_sum + 0.00001,
    speech_sum: course.speech_sum + 0.000001,
    review_total_weight: course.review_total_weight + 0.000001,
    grade: course.grade + 0.000001,
    load: course.load + 0.00001,
    speech: course.speech + 0.00001,
    title_en_no_space: course.title_en_no_space,
    title_no_space: course.title_no_space,
  }
}

export function toJsonFeedRelated(course: subject_course): ICourse.FeedRelated {
  return {
    ...toJsonFeedBasic(course),
    related_courses_prior: [], // TODO: related courses 비어있는게 맞는지 확인
    related_courses_posterior: [],
  }
}

export function toJsonCourseBasic(
  course: Omit<ECourse.Details, 'subject_course_professors'>,
  lecture: subject_lecture,
): ICourse.Basic {
  return {
    id: course.id,
    old_old_code: course.old_code,
    old_code: course.new_code,
    department: toJsonDepartment(course.subject_department, true),
    type: course.type,
    type_en: course.type_en,
    title: course.title,
    title_en: course.title_en,
    summary: course.summury, // Todo: fix summury typo in db.
    review_total_weight: course.review_total_weight + 0.000001,
    credit: lecture.credit ?? 0,
    credit_au: lecture.credit_au ?? 0,
    num_classes: lecture.num_classes ?? 0,
    num_labs: lecture.num_labs ?? 0,
  }
}

export function toJsonCourseDetail(
  course: ECourse.Details,
  lecture: subject_lecture,
  professor: subject_professor[],
): ICourse.Detail {
  const basic = toJsonCourseBasic(course, lecture)
  const professorJson: IProfessor.Basic[] = toJsonProfessors(professor, true)
  const professorSorted = applyOrder<IProfessor.Basic>(professorJson, ['name'])
  return {
    ...basic,
    related_courses_prior: [],
    related_courses_posterior: [],
    professors: professorSorted,
    grade: course.grade + 0.000001,
    load: course.load + 0.000001,
    speech: course.speech + 0.000001,
  }
}

export function addIsRead(course: ICourse.Detail, isRead: boolean): ICourse.DetailWithIsRead {
  return Object.assign(course, { userspecific_is_read: isRead })
}
