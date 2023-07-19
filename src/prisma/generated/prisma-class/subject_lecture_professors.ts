import { ApiProperty } from '@nestjs/swagger';

export class subject_lecture_professors {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  lecture_id: number;

  @ApiProperty({ type: Number })
  professor_id: number;
}
