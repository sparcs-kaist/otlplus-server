import { ApiProperty } from '@nestjs/swagger';

export class subject_professor_course_list {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  professor_id: number;

  @ApiProperty({ type: Number })
  course_id: number;
}
