import { SemesterEnum, TimeBlock, TimeBlockDay } from './constants';
import { ILecture } from './ILecture';
import { IPersonal } from './IPersonal';
import { ITimetable } from './ITimetable';
export declare namespace IMeeting {
  interface Group {
    id: number;
    year: number;
    semester: SemesterEnum;
    begin: number;
    end: number;
    days: TimeBlockDay[];
    start_week: number;
    end_week: number;
    title: string;
    leader_user_profile_id: number;
    schedule: IMeeting.Schedule[];
    max_member: number;
    members: IMeeting.Member[];
    result?: IMeeting.Result;
  }
  interface Member {
    id: number;
    user_id?: number;
    studentNumber: string;
    name: string;
    available_timeBlock: TimeBlock[];
  }
  interface Schedule {
    timeBlock: TimeBlock;
    available_members: IMeeting.Member[];
    unavailable_members: IMeeting.Member[];
  }
  interface Result {
    id: number;
    group_id: number;
    year: number;
    semester: number;
    start_week: number;
    end_week: number;
    title: string;
    timeBlocks: TimeBlock &
      {
        available_members: IMeeting.Member[];
        unavailable_members: IMeeting.Member[];
      }[];
    place: string | null;
    description: string | null;
    color: number;
  }
  interface HiddenTimetable extends Omit<ITimetable.Summary, 'lectures' | 'personals' | 'meetings'> {
    lectures: Pick<ILecture.Summary, 'timeBlocks'>[];
    personals: Pick<IPersonal.Block, 'timeBlock'>[];
    meetings: Pick<IMeeting.Result, 'timeBlocks'>[];
  }
}
