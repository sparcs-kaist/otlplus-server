import { LectureBasic, LectureGenerateTitle, LectureScore } from '@otl/server-nest/modules/lectures/domain/lecture'

import { ELecture } from '@otl/prisma-client/entities'

export function mapLectureScore(lecture: ELecture.Basic): LectureScore {
  return {
    gradeSum: lecture.grade_sum,
    loadSum: lecture.load_sum,
    speechSum: lecture.speech_sum,
    grade: lecture.grade,
    load: lecture.load,
    speech: lecture.speech,
    reviewTotalWeight: lecture.review_total_weight,
  }
}

export function mapLectureGenerateTitle(lecture: ELecture.Basic): LectureGenerateTitle {
  return {
    classTitle: lecture.class_title,
    classTitleEn: lecture.class_title_en,
    commonTitle: lecture.common_title,
    commonTitleEn: lecture.common_title_en,
    titleNoSpace: lecture.title_no_space,
    titleEnNoSpace: lecture.title_en_no_space,
  }
}
export function mapLecture(lecture: ELecture.Basic): LectureBasic {
  return {
    id: lecture.id,
    code: lecture.code,
    oldCode: lecture.old_code,
    newCode: lecture.new_code,
    departmentId: lecture.department_id,
    classNo: lecture.class_no,
    title: lecture.title,
    titleEn: lecture.title_en,
    type: lecture.type,
    typeEn: lecture.type_en,
    audience: lecture.audience,
    credit: lecture.credit,
    numClasses: lecture.num_classes,
    numLabs: lecture.num_labs,
    creditAu: lecture.credit_au,
    limit: lecture.limit,
    numPeople: lecture.num_people,
    isEnglish: lecture.is_english,
    deleted: lecture.deleted,
    courseId: lecture.course_id,
    semester: {
      year: lecture.year,
      semester: lecture.semester,
    },
    score: mapLectureScore(lecture),
    generatedTitle: mapLectureGenerateTitle(lecture),
  }
}
