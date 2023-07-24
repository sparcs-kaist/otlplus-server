import { main_relatedcoursedailyuserfeed } from './main_relatedcoursedailyuserfeed';
import { planner_futureplanneritem } from './planner_futureplanneritem';
import { subject_department } from './subject_department';
import { subject_course_related_courses_posterior } from './subject_course_related_courses_posterior';
import { subject_course_related_courses_prior } from './subject_course_related_courses_prior';
import { subject_courseuser } from './subject_courseuser';
import { subject_course_professors } from './subject_course_professors';
import { subject_lecture } from './subject_lecture';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class subject_course {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String })
  old_code: string;

  @ApiProperty({ type: Number })
  department_id: number;

  @ApiProperty({ type: String })
  type: string;

  @ApiProperty({ type: String })
  type_en: string;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: String })
  title_en: string;

  @ApiProperty({ type: String })
  summury: string;

  @ApiProperty({ type: Number })
  grade_sum: number;

  @ApiProperty({ type: Number })
  load_sum: number;

  @ApiProperty({ type: Number })
  speech_sum: number;

  @ApiProperty({ type: Number })
  review_total_weight: number;

  @ApiProperty({ type: Number })
  grade: number;

  @ApiProperty({ type: Number })
  load: number;

  @ApiProperty({ type: Number })
  speech: number;

  @ApiPropertyOptional({ type: Date })
  latest_written_datetime?: Date;

  @ApiProperty({ type: String })
  title_en_no_space: string;

  @ApiProperty({ type: String })
  title_no_space: string;

  @ApiProperty({ isArray: true, type: () => main_relatedcoursedailyuserfeed })
  main_relatedcoursedailyuserfeed: main_relatedcoursedailyuserfeed[];

  @ApiProperty({ isArray: true, type: () => planner_futureplanneritem })
  planner_futureplanneritem: planner_futureplanneritem[];

  @ApiProperty({ type: () => subject_department })
  subject_department: subject_department;

  @ApiProperty({
    isArray: true,
    type: () => subject_course_related_courses_posterior,
  })
  subject_course_related_courses_posterior_subject_course_related_courses_posterior_from_course_idTosubject_course: subject_course_related_courses_posterior[];

  @ApiProperty({
    isArray: true,
    type: () => subject_course_related_courses_posterior,
  })
  subject_course_related_courses_posterior_subject_course_related_courses_posterior_to_course_idTosubject_course: subject_course_related_courses_posterior[];

  @ApiProperty({
    isArray: true,
    type: () => subject_course_related_courses_prior,
  })
  subject_course_related_courses_prior_subject_course_related_courses_prior_from_course_idTosubject_course: subject_course_related_courses_prior[];

  @ApiProperty({
    isArray: true,
    type: () => subject_course_related_courses_prior,
  })
  subject_course_related_courses_prior_subject_course_related_courses_prior_to_course_idTosubject_course: subject_course_related_courses_prior[];

  @ApiProperty({ isArray: true, type: () => subject_courseuser })
  subject_courseuser: subject_courseuser[];

  @ApiProperty({ isArray: true, type: () => subject_course_professors })
  subject_course_professors: subject_course_professors[];

  @ApiProperty({ isArray: true, type: () => subject_lecture })
  lecture: subject_lecture[];
}
