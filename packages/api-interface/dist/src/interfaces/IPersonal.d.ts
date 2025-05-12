import { TimeBlock, TimeTableColorEnum } from './constants';
export declare namespace IPersonal {
  interface Block {
    id: number;
    year: number;
    semester: number;
    user_id: number;
    timetable_id: number | null;
    title: string;
    timeBlock: TimeBlock[];
    place: string | null;
    description: string | null;
    color: TimeTableColorEnum;
  }
}
