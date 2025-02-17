import { SemesterEnum, TimeBlock, TimeBlockDay, TimeTableColorEnum } from './constants';
import { ILecture } from './ILecture';
import { IPersonal } from './IPersonal';
import { ITimetable } from './ITimetable';


export namespace IMeeting {
	export interface Group {
		id: number;
		year: number;
        semester: SemesterEnum;
		begin: number;
		end: number;
		days: TimeBlockDay[];
		
		title: string;
		leader_user_profile_id: number; //session_user_profile.id
		schedule: IMeeting.Schedule[]
		max_member: number;
		members : IMeeting.Member[];
		
		result ?: IMeeting.Result
	}
	

	export interface Member {
		id: number; // IMeeting_group_participant.id
		user_id ?: number; // session_user_profile.id
		studentNumber: string; // 학번
		name : string; // `${firstName} ${lastName}`
		available_timeBlock : TimeBlock[];
	}	
	
	export interface Schedule {
		timeBlock: TimeBlock ;
		available_members: IMeeting.Member[];
		unavailable_members: IMeeting.Member[];
	}
	
	export interface Result {
		id: number; // IMeeting_group_result_id
		group_id: number; // IMeeting_group_id
		year: number;
        semester: number;
    
		available_members: IMeeting.Member[]; 
		unavailable_members: IMeeting.Member[];
		title: string;
		timeBlocks: TimeBlock[];
		place: string | null; // 장소
		description: string | null; // 설명
		color: TimeTableColorEnum ; // 색상 원래 어떻게 저장하지
	}

	export interface HiddenTimetable extends Omit<ITimetable.Summary, "lectures" | "personals" | "meetings"> {
		lectures: Pick<ILecture.Summary, "timeBlocks"> ;
		personals: Pick<IPersonal.Block, "timeBlocks"> ;
		meetings: Pick<IMeeting.Result, "timeBlocks">;
	}
}