import { subject_lecture } from './subject_lecture';
import { ApiProperty } from '@nestjs/swagger';

export class subject_examtime {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  day: number;

  @ApiProperty({ type: Date })
  begin: Date;

  @ApiProperty({ type: Date })
  end: Date;

  @ApiProperty({ type: Number })
  lecture_id: number;

  @ApiProperty({ type: () => subject_lecture })
  subject_lecture: subject_lecture;
}
