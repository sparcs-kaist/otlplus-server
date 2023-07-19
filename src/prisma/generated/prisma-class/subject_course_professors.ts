import { ApiProperty } from '@nestjs/swagger';

export class subject_course_professors {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  course_id: number;

  @ApiProperty({ type: Number })
  professor_id: number;
}
