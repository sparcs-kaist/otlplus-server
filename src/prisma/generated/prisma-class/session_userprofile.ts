import { main_ratedailyuserfeed } from './main_ratedailyuserfeed';
import { main_relatedcoursedailyuserfeed } from './main_relatedcoursedailyuserfeed';
import { main_reviewwritedailyuserfeed } from './main_reviewwritedailyuserfeed';
import { planner_planner } from './planner_planner';
import { review_review } from './review_review';
import { subject_department } from './subject_department';
import { session_userprofile_favorite_departments } from './session_userprofile_favorite_departments';
import { session_userprofile_majors } from './session_userprofile_majors';
import { session_userprofile_minors } from './session_userprofile_minors';
import { session_userprofile_specialized_major } from './session_userprofile_specialized_major';
import { session_userprofile_taken_lectures } from './session_userprofile_taken_lectures';
import { subject_courseuser } from './subject_courseuser';
import { support_rate } from './support_rate';
import { timetable_timetable } from './timetable_timetable';
import { timetable_wishlist } from './timetable_wishlist';
import { review_reviewvote } from './review_reviewvote';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class session_userprofile {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String })
  student_id: string;

  @ApiProperty({ type: String })
  sid: string;

  @ApiPropertyOptional({ type: Number })
  department_id?: number;

  @ApiPropertyOptional({ type: String })
  email?: string;

  @ApiProperty({ type: Date })
  date_joined: Date;

  @ApiProperty({ type: String })
  first_name: string;

  @ApiProperty({ type: String })
  last_name: string;

  @ApiPropertyOptional({ type: String })
  refresh_token?: string;

  @ApiProperty({ isArray: true, type: () => main_ratedailyuserfeed })
  main_ratedailyuserfeed: main_ratedailyuserfeed[];

  @ApiProperty({ isArray: true, type: () => main_relatedcoursedailyuserfeed })
  main_relatedcoursedailyuserfeed: main_relatedcoursedailyuserfeed[];

  @ApiProperty({ isArray: true, type: () => main_reviewwritedailyuserfeed })
  main_reviewwritedailyuserfeed: main_reviewwritedailyuserfeed[];

  @ApiProperty({ isArray: true, type: () => planner_planner })
  planner_planner: planner_planner[];

  @ApiProperty({ isArray: true, type: () => review_review })
  reviews: review_review[];

  @ApiPropertyOptional({ type: () => subject_department })
  department?: subject_department;

  @ApiProperty({
    isArray: true,
    type: () => session_userprofile_favorite_departments,
  })
  favorite_departments: session_userprofile_favorite_departments[];

  @ApiProperty({ isArray: true, type: () => session_userprofile_majors })
  session_userprofile_majors: session_userprofile_majors[];

  @ApiProperty({ isArray: true, type: () => session_userprofile_minors })
  session_userprofile_minors: session_userprofile_minors[];

  @ApiProperty({
    isArray: true,
    type: () => session_userprofile_specialized_major,
  })
  session_userprofile_specialized_major: session_userprofile_specialized_major[];

  @ApiProperty({
    isArray: true,
    type: () => session_userprofile_taken_lectures,
  })
  taken_lectures: session_userprofile_taken_lectures[];

  @ApiProperty({ isArray: true, type: () => subject_courseuser })
  subject_courseuser: subject_courseuser[];

  @ApiProperty({ isArray: true, type: () => support_rate })
  support_rate: support_rate[];

  @ApiProperty({ isArray: true, type: () => timetable_timetable })
  timetable_timetable: timetable_timetable[];

  @ApiPropertyOptional({ type: () => timetable_wishlist })
  timetable_wishlist?: timetable_wishlist;

  @ApiProperty({ isArray: true, type: () => review_reviewvote })
  reviewvote: review_reviewvote[];
}
