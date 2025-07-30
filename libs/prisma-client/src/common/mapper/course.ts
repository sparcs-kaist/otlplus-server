import { CourseBasic, CourseScore } from '@otl/server-nest/modules/courses/domain/course'

import { ECourse } from '@otl/prisma-client/entities'

export function mapCourseScore(course: ECourse.Basic): CourseScore {
  return {
    gradeSum: course.grade_sum,
    loadSum: course.load_sum,
    speechSum: course.speech_sum,
    grade: course.grade,
    load: course.load,
    speech: course.speech,
    reviewTotalWeight: course.review_total_weight,
  }
}

export function mapCourse(course: ECourse.Basic): CourseBasic {
  return {
    id: course.id,
    oldCode: course.old_code,
    newCode: course.new_code,
    departmentId: course.department_id,
    title: course.title,
    titleEn: course.title_en,
    type: course.type,
    typeEn: course.type_en,
    summary: course.summury,
    score: mapCourseScore(course),
    latestWrittenDatetime: course.latest_written_datetime,
    titleNoSpace: course.title_no_space,
    titleEnNoSpace: course.title_en_no_space,
    representativeLectureId: course.representative_lecture_id,
  }
}
