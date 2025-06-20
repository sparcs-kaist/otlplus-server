import { ITimetable } from '@otl/server-nest/common/interfaces'

import { ELecture, ETimetable } from '@otl/prisma-client/entities'

import { toJsonLectureDetail, v2toJsonLectureDetail } from './lecture.serializer'

export const toJsonTimetable = (
  timetable: ETimetable.Details | ETimetable.Basic,
  lectures?: ELecture.Details[],
): ITimetable.Response => {
  const lecturesList = 'timetable_timetable_lectures' in timetable
    ? timetable.timetable_timetable_lectures.map((x) => x.subject_lecture)
    : lectures

  return {
    id: timetable.id,
    lectures: lecturesList?.map((lecture) => toJsonLectureDetail(lecture)),
    arrange_order: timetable.arrange_order,
  }
}

export const v2toJsonTimetable = (timetable: ETimetable.Details | ETimetable.Basic): ITimetable.v2Response => ({
  timetableId: timetable.id,
  year: timetable.year,
  semester: timetable.semester,
  timetableOrder: timetable.arrange_order,
  userId: timetable.user_id,
})

export const v2DetailedtoJsonTimetable = (
  timetable: ETimetable.Details | ETimetable.Basic,
  lectures?: ELecture.Details[],
): ITimetable.v2DetailedResponse => {
  const lecturesList = 'timetable_timetable_lectures' in timetable
    ? timetable.timetable_timetable_lectures.map((x) => x.subject_lecture)
    : lectures

  return {
    timetableId: timetable.id,
    timetableName: null, // timetable.name, 문제: timetable 데이터베이스에 name 속성이 없음
    userId: timetable.user_id,
    year: timetable.year,
    semester: timetable.semester,
    timetableOrder: timetable.arrange_order,
    lectures: lecturesList?.map((lecture) => v2toJsonLectureDetail(lecture)),
  }
}
