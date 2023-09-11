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
  if ('timetable_timetable_lectures' in timetable) {
    const id = timetable.id;
    const lectures = timetable.timetable_timetable_lectures
      .map((x) => x.subject_lecture)
      .map((lecture) => toJsonLecture<false>(lecture, false));
    const arrange_order = timetable.arrange_order;
    return {
      id: id,
      lectures: lectures,
      arrange_order: arrange_order,
    };
  } else {
    const id = timetable.id;
    const lectureLists = lectures.map((lecture) =>
      toJsonLecture<false>(lecture, false),
    );
    const arrange_order = timetable.arrange_order;
    return {
      id: id,
      lectures: lectureLists,
      arrange_order: arrange_order,
    };
  }
};
