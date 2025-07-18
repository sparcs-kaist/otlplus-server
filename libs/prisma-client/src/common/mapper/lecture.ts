import {
  LectureBasic,
  LectureGenerateTitle,
  LectureRelationMap,
  LectureScore,
  LectureWithRelations,
} from '@otl/server-nest/modules/lectures/domain/lecture'

import { mapCourse } from '@otl/prisma-client/common/mapper/course'
import { mapDepartment } from '@otl/prisma-client/common/mapper/department'
import { ECourse, EDepartment, ELecture } from '@otl/prisma-client/entities'

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

const relationPrismaToDomainMap = {
  subject_department: 'department',
  subject_lecture_professors: 'professors',
  // subject_classtime: 'classtimes',
  // subject_examtime: 'examtimes',
  course: 'course',
} as const
type RelationPrismaToDomainMap = typeof relationPrismaToDomainMap

type IncludedRelations<T extends ELecture.Basic> = {
  [K in keyof T & keyof RelationPrismaToDomainMap]: NonNullable<T[K]> extends object
    ? RelationPrismaToDomainMap[K]
    : never
}[keyof T & keyof RelationPrismaToDomainMap]

const relationMappers = {
  subject_department: (department: EDepartment.Basic) => mapDepartment(department),
  course: (course: ECourse.Basic) => mapCourse(course),
}

export function mapLecture<T extends ELecture.Basic>(lecture: T): LectureWithRelations<IncludedRelations<T>> {
  const base: LectureBasic = {
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

  const withRelations = { ...base } as Partial<LectureRelationMap>

  Object.keys(relationMappers).forEach((key) => {
    if (key in lecture && lecture[key as keyof T]) {
      const domainKey = relationPrismaToDomainMap[key as keyof RelationPrismaToDomainMap]

      const mapper = relationMappers[key as keyof typeof relationMappers]

      const relationObject = lecture[key as keyof T];
      (withRelations as any)[domainKey] = mapper(relationObject as any)
    }
  })
  return withRelations as LectureWithRelations<IncludedRelations<T>>
}
