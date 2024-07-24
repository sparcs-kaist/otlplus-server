import {
  subject_course,
  subject_lecture,
  subject_professor,
} from '@prisma/client';
import { ECourse } from 'src/common/entities/ECourse';
import { applyOrder } from '../../utils/search.utils';
import { ICourse } from '../ICourse';
import { ProfessorResponseDto } from '../dto/professor/professor.response.dto';
import { toJsonDepartment } from './department.serializer';
import { toJsonProfessors } from './professor.serializer';

export function toJsonFeedBasic(course: subject_course): ICourse.FeedBasic {
  return {
    id: course.id,
    old_code: course.old_code,
    department_id: course.department_id,
    type: course.type,
    type_en: course.type_en,
    title: course.title,
    title_en: course.title_en,
    summary: course.summury,
    grade_sum: course.grade_sum,
    load_sum: course.load_sum,
    speech_sum: course.speech_sum,
    review_total_weight: course.review_total_weight,
    grade: course.grade,
    load: course.load,
    speech: course.speech,
    title_en_no_space: course.title_en_no_space,
    title_no_space: course.title_no_space,
  };
}

export function toJsonFeedRelated(course: subject_course): ICourse.FeedRelated {
  return {
    ...toJsonFeedBasic(course),
    related_courses_prior: [], // TODO: related courses 비어있는게 맞는지 확인
    related_courses_posterior: [],
  };
}

export function toJsonCourseBasic(
  course: Omit<ECourse.Details, 'subject_course_professors'>,
  lecture: subject_lecture,
): ICourse.Basic {
  return {
    id: course.id,
    old_code: course.old_code,
    department: toJsonDepartment(course.subject_department, true),
    type: course.type,
    type_en: course.type_en,
    title: course.title,
    title_en: course.title_en,
    summary: course.summury, // Todo: fix summury typo in db.
    review_total_weight: course.review_total_weight,
    credit: lecture.credit ?? 0,
    credit_au: lecture.credit_au ?? 0,
    num_classes: lecture.num_classes ?? 0,
    num_labs: lecture.num_labs ?? 0,
  };
}

export function toJsonCourseDetail(
  course: ECourse.Details,
  lecture: subject_lecture,
  professor: subject_professor[],
): ICourse.Detail {
  const basic = toJsonCourseBasic(course, lecture);
  const professorJson: ProfessorResponseDto[] = toJsonProfessors(
    professor,
    true,
  );
  const professorSorted = applyOrder<ProfessorResponseDto>(professorJson, [
    'name',
  ]);
  return {
    ...basic,
    related_courses_prior: [],
    related_courses_posterior: [],
    professors: professorSorted,
    grade: course.grade,
    load: course.load,
    speech: course.speech,
  };
}

export function addIsRead(
  course: ICourse.Detail,
  isRead: boolean,
): ICourse.DetailWithIsRead {
  return Object.assign(course, { userspecific_is_read: isRead });
}
