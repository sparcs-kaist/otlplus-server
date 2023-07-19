import { session_userprofile } from './session_userprofile';
import { timetable_timetable_lectures } from './timetable_timetable_lectures';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class timetable_timetable {
  @ApiProperty({ type: Number })
  id: number;

  @ApiPropertyOptional({ type: Number })
  year?: number;

  @ApiPropertyOptional({ type: Number })
  semester?: number;

  @ApiProperty({ type: Number })
  user_id: number;

  @ApiProperty({ type: Number })
  arrange_order: number;

  @ApiProperty({ type: () => session_userprofile })
  session_userprofile: session_userprofile;

  @ApiProperty({ isArray: true, type: () => timetable_timetable_lectures })
  timetable_timetable_lectures: timetable_timetable_lectures[];
}
