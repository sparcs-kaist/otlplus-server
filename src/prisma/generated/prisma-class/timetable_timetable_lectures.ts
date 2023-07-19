import { subject_lecture } from './subject_lecture';
import { timetable_timetable } from './timetable_timetable';
import { ApiProperty } from '@nestjs/swagger';

export class timetable_timetable_lectures {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  timetable_id: number;

  @ApiProperty({ type: Number })
  lecture_id: number;

  @ApiProperty({ type: () => subject_lecture })
  subject_lecture: subject_lecture;

  @ApiProperty({ type: () => timetable_timetable })
  timetable_timetable: timetable_timetable;
}
