import { ELecture } from '@otl/api-interface/src/entities/ELecture';
import { ETimetable } from '@otl/api-interface/src/entities/ETimetable';
import { ITimetable } from '@otl/api-interface/src/interfaces/ITimetable';
import { toJsonLectureDetail } from './lecture.serializer';

export const toJsonTimetable = (
  timetable: ETimetable.Details | ETimetable.Basic,
  lectures?: ELecture.Details[],
): ITimetable.Response => {
  const lecturesList =
    'timetable_timetable_lectures' in timetable
      ? timetable.timetable_timetable_lectures.map((x) => x.subject_lecture)
      : lectures;

  return {
    id: timetable.id,
    lectures: lecturesList?.map((lecture) => toJsonLectureDetail(lecture)),
    arrange_order: timetable.arrange_order,
  };
};
