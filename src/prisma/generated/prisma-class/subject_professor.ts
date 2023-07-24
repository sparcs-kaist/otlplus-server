import { subject_course_professors } from './subject_course_professors';
import { subject_lecture_professors } from './subject_lecture_professors';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class subject_professor {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String })
  professor_name: string;

  @ApiPropertyOptional({ type: String })
  professor_name_en?: string;

  @ApiProperty({ type: Number })
  professor_id: number;

  @ApiProperty({ type: String })
  major: string;

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

  @ApiProperty({ isArray: true, type: () => subject_course_professors })
  subject_course_professors: subject_course_professors[];

  @ApiProperty({ isArray: true, type: () => subject_lecture_professors })
  subject_lecture_professors: subject_lecture_professors[];
}
