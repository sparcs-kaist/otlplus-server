import { ELecture } from 'src/common/entities/ELecture';
import { ETimetable } from 'src/common/entities/ETimetable';
import { ITimetable } from '../ITimetable';
import { toJsonLectureDetail } from './lecture.serializer';

export const toJsonTimetable = (
  timetable: ETimetable.Details | ETimetable.Basic,
  lectures?: ELecture.Details[],
): ITimetable.Response => {
  const lecturesList =
    'timetable_timetable_lectures' in timetable
      ? timetable.timetable_timetable_lectures.map((x) => x.subject_lecture)
      : lectures;
  if (lecturesList === undefined) {
    throw new Error('lecturesList is undefined');
  }
  return {
    id: timetable.id,
    lectures: lecturesList.map((lecture) => toJsonLectureDetail(lecture)),
    arrange_order: timetable.arrange_order,
  };
};
