import { ILecture } from '@otl/api-interface/src/interfaces/ILecture';
import { IMeeting } from './IMeeting';
import { IPersonal } from './IPersonal';
export declare const TIMETABLE_MAX_LIMIT = 50;
export declare namespace ITimetable {
  interface IClasstime {
    id: number;
    day: number;
    begin: Date;
    end: Date;
    type: string;
    building_id: string | null;
    building_full_name: string | null;
    building_full_name_en: string | null;
    room_name: string | null;
    unit_time: number | null;
    lecture_id: number | null;
  }
  interface Response {
    id: number;
    lectures: ILecture.Detail[] | null | undefined;
    arrange_order: number;
  }
  interface Summary {
    id: number | null;
    year: number;
    semester: number;
    arrange_order: number;
    lectures: ILecture.Summary[];
    personals: IPersonal.Block[];
    meetings: IMeeting.Result[];
  }
  interface Response2 {
    id: number;
    lectures: ILecture.Detail2[];
    personals: IPersonal.Block[];
    meetings: IMeeting.Result[];
    arrange_order: number;
  }
  class QueryDto {
    year?: number;
    semester?: number;
    order?: string[];
    offset?: number;
    limit?: number;
  }
  class CreateDto {
    year: number;
    semester: number;
    lectures: number[];
  }
  class AddLectureDto {
    lecture: number;
  }
  class ReorderTimetableDto {
    arrange_order: number;
  }
}
