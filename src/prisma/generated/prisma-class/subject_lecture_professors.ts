import { subject_lecture } from './subject_lecture';
import { subject_professor } from './subject_professor';
import { ApiProperty } from '@nestjs/swagger';

export class subject_lecture_professors {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  lecture_id: number;

  @ApiProperty({ type: Number })
  professor_id: number;

  @ApiProperty({ type: () => subject_lecture })
  lecture: subject_lecture;

  @ApiProperty({ type: () => subject_professor })
  professor: subject_professor;
}
