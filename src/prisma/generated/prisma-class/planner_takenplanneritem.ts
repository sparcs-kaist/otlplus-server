import { subject_lecture } from './subject_lecture';
import { planner_planner } from './planner_planner';
import { ApiProperty } from '@nestjs/swagger';

export class planner_takenplanneritem {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Boolean })
  is_excluded: boolean;

  @ApiProperty({ type: Number })
  lecture_id: number;

  @ApiProperty({ type: Number })
  planner_id: number;

  @ApiProperty({ type: () => subject_lecture })
  subject_lecture: subject_lecture;

  @ApiProperty({ type: () => planner_planner })
  planner_planner: planner_planner;
}
