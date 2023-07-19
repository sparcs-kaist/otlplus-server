import { subject_lecture } from './subject_lecture';
import { timetable_oldtimetable } from './timetable_oldtimetable';
import { ApiProperty } from '@nestjs/swagger';

export class timetable_oldtimetable_lectures {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  oldtimetable_id: number;

  @ApiProperty({ type: Number })
  lecture_id: number;

  @ApiProperty({ type: () => subject_lecture })
  subject_lecture: subject_lecture;

  @ApiProperty({ type: () => timetable_oldtimetable })
  timetable_oldtimetable: timetable_oldtimetable;
}
