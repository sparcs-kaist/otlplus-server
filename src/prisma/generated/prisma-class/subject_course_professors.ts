import { subject_course } from './subject_course';
import { subject_professor } from './subject_professor';
import { ApiProperty } from '@nestjs/swagger';

export class subject_course_professors {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  course_id: number;

  @ApiProperty({ type: Number })
  professor_id: number;

  @ApiProperty({ type: () => subject_course })
  course: subject_course;

  @ApiProperty({ type: () => subject_professor })
  professor: subject_professor;
}
