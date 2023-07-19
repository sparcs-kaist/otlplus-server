import { subject_lecture } from './subject_lecture';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class subject_classtime {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  day: number;

  @ApiProperty({ type: Date })
  begin: Date;

  @ApiProperty({ type: Date })
  end: Date;

  @ApiProperty({ type: String })
  type: string;

  @ApiPropertyOptional({ type: String })
  building_id?: string;

  @ApiPropertyOptional({ type: String })
  building_full_name?: string;

  @ApiPropertyOptional({ type: String })
  building_full_name_en?: string;

  @ApiPropertyOptional({ type: String })
  room_name?: string;

  @ApiPropertyOptional({ type: Number })
  unit_time?: number;

  @ApiPropertyOptional({ type: Number })
  lecture_id?: number;

  @ApiPropertyOptional({ type: () => subject_lecture })
  subject_lecture?: subject_lecture;
}
