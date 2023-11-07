import {
  LectureDetails,
  TimeTableBasic,
  TimeTableDetails,
} from '../../schemaTypes/types';
import { TimetableResponseDto } from '../dto/timetable/timetable.response.dto';
import { toJsonLecture } from './lecture.serializer';

export const toJsonTimetable = (
  timetable: TimeTableDetails | TimeTableBasic,
  lectures?: LectureDetails[],
): TimetableResponseDto => {
  const lecturesList =
    'timetable_timetable_lectures' in timetable
      ? timetable.timetable_timetable_lectures.map((x) => x.subject_lecture)
      : lectures;
  if (lecturesList === undefined) {
    throw new Error('lecturesList is undefined');
  }
  return {
    id: timetable.id,
    lectures: lecturesList.map((lecture) =>
      toJsonLecture<false>(lecture, false),
    ),
    arrange_order: timetable.arrange_order,
  };
};
