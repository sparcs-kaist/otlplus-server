import { subject_lecture, subject_professor } from '@prisma/client';
import { CourseDetails, NESTED } from '../../schemaTypes/types';
import { applyOrder } from '../../utils/search.utils';
import { CourseResponseDtoNested } from '../dto/course/course.response.dto';
import { ProfessorResponseDto } from '../dto/professor/professor.response.dto';
import { toJsonDepartment } from './department.serializer';
import { toJsonProfessor } from './professor.serializer';

export function toJsonCourse<T>(
  course: T extends NESTED
    ? Omit<CourseDetails, 'subject_course_professors'>
    : CourseDetails,
  lecture: subject_lecture,
  professor: subject_professor[],
  nested: T extends NESTED ? true : false,
): CourseResponseDtoNested {
  let result = {
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

  if (nested) {
    return result;
  }

  const professorJson: ProfessorResponseDto[] = toJsonProfessor(
    professor,
    true,
  );
  const professorSorted = applyOrder<ProfessorResponseDto>(professorJson, [
    'name',
  ]);
  result = Object.assign(result, {
    related_courses_prior: [],
    related_courses_posterior: [],
    professors: professorSorted,
    grade: course.grade,
    load: course.load,
    speech: course.speech,
  });
  return result;
}
