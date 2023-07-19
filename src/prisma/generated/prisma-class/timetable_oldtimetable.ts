import { timetable_oldtimetable_lectures } from './timetable_oldtimetable_lectures';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class timetable_oldtimetable {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String })
  student_id: string;

  @ApiPropertyOptional({ type: Number })
  year?: number;

  @ApiPropertyOptional({ type: Number })
  semester?: number;

  @ApiPropertyOptional({ type: Number })
  table_no?: number;

  @ApiProperty({ isArray: true, type: () => timetable_oldtimetable_lectures })
  timetable_oldtimetable_lectures: timetable_oldtimetable_lectures[];
}
