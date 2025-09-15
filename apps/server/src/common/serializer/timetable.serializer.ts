import { ITimetable } from '@otl/server-nest/common/interfaces'

import { ELecture, ETimetable } from '@otl/prisma-client/entities'

import { toJsonLectureDetail } from './lecture.serializer'

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
