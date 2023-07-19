import { subject_course } from './subject_course';
import { main_reviewwritedailyuserfeed } from './main_reviewwritedailyuserfeed';
import { planner_takenplanneritem } from './planner_takenplanneritem';
import { session_userprofile_taken_lectures } from './session_userprofile_taken_lectures';
import { subject_classtime } from './subject_classtime';
import { subject_examtime } from './subject_examtime';
import { timetable_oldtimetable_lectures } from './timetable_oldtimetable_lectures';
import { timetable_timetable_lectures } from './timetable_timetable_lectures';
import { timetable_wishlist_lectures } from './timetable_wishlist_lectures';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class subject_lecture {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String })
  code: string;

  @ApiProperty({ type: String })
  old_code: string;

  @ApiProperty({ type: Number })
  year: number;

  @ApiProperty({ type: Number })
  semester: number;

  @ApiProperty({ type: Number })
  department_id: number;

  @ApiProperty({ type: String })
  class_no: string;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: String })
  title_en: string;

  @ApiProperty({ type: String })
  type: string;

  @ApiProperty({ type: String })
  type_en: string;

  @ApiProperty({ type: Number })
  audience: number;

  @ApiProperty({ type: Number })
  credit: number;

  @ApiProperty({ type: Number })
  num_classes: number;

  @ApiProperty({ type: Number })
  num_labs: number;

  @ApiProperty({ type: Number })
  credit_au: number;

  @ApiProperty({ type: Number })
  limit: number;

  @ApiPropertyOptional({ type: Number })
  num_people?: number;

  @ApiProperty({ type: Boolean })
  is_english: boolean;

  @ApiProperty({ type: Boolean })
  deleted: boolean;

  @ApiProperty({ type: Number })
  course_id: number;

  @ApiProperty({ type: () => subject_course })
  course: subject_course;

  @ApiProperty({ type: Number })
  grade_sum: number;

  @ApiProperty({ type: Number })
  load_sum: number;

  @ApiProperty({ type: Number })
  speech_sum: number;

  @ApiProperty({ type: Number })
  grade: number;

  @ApiProperty({ type: Number })
  load: number;

  @ApiProperty({ type: Number })
  speech: number;

  @ApiProperty({ type: Number })
  review_total_weight: number;

  @ApiPropertyOptional({ type: String })
  class_title?: string;

  @ApiPropertyOptional({ type: String })
  class_title_en?: string;

  @ApiPropertyOptional({ type: String })
  common_title?: string;

  @ApiPropertyOptional({ type: String })
  common_title_en?: string;

  @ApiProperty({ isArray: true, type: () => main_reviewwritedailyuserfeed })
  main_reviewwritedailyuserfeed: main_reviewwritedailyuserfeed[];

  @ApiProperty({ isArray: true, type: () => planner_takenplanneritem })
  planner_takenplanneritem: planner_takenplanneritem[];

  @ApiProperty({
    isArray: true,
    type: () => session_userprofile_taken_lectures,
  })
  students: session_userprofile_taken_lectures[];

  @ApiProperty({ isArray: true, type: () => subject_classtime })
  subject_classtime: subject_classtime[];

  @ApiProperty({ isArray: true, type: () => subject_examtime })
  subject_examtime: subject_examtime[];

  @ApiProperty({ isArray: true, type: () => timetable_oldtimetable_lectures })
  timetable_oldtimetable_lectures: timetable_oldtimetable_lectures[];

  @ApiProperty({ isArray: true, type: () => timetable_timetable_lectures })
  timetable_timetable_lectures: timetable_timetable_lectures[];

  @ApiProperty({ isArray: true, type: () => timetable_wishlist_lectures })
  timetable_wishlist_lectures: timetable_wishlist_lectures[];
}
