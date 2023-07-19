import { subject_semester } from './subject_semester';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class main_rankedreviewdailyfeed {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Date })
  date: Date;

  @ApiProperty({ type: Number })
  priority: number;

  @ApiProperty({ type: Boolean })
  visible: boolean;

  @ApiPropertyOptional({ type: Number })
  semester_id?: number;

  @ApiPropertyOptional({ type: () => subject_semester })
  subject_semester?: subject_semester;
}
