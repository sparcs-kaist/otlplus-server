import { subject_course } from './subject_course';
import { ApiProperty } from '@nestjs/swagger';

export class subject_course_related_courses_posterior {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  from_course_id: number;

  @ApiProperty({ type: Number })
  to_course_id: number;

  @ApiProperty({ type: () => subject_course })
  subject_course_subject_course_related_courses_posterior_from_course_idTosubject_course: subject_course;

  @ApiProperty({ type: () => subject_course })
  subject_course_subject_course_related_courses_posterior_to_course_idTosubject_course: subject_course;
}
