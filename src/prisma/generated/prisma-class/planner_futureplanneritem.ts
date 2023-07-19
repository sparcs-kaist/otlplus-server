import { subject_course } from './subject_course';
import { planner_planner } from './planner_planner';
import { ApiProperty } from '@nestjs/swagger';

export class planner_futureplanneritem {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Boolean })
  is_excluded: boolean;

  @ApiProperty({ type: Number })
  year: number;

  @ApiProperty({ type: Number })
  semester: number;

  @ApiProperty({ type: Number })
  course_id: number;

  @ApiProperty({ type: Number })
  planner_id: number;

  @ApiProperty({ type: () => subject_course })
  subject_course: subject_course;

  @ApiProperty({ type: () => planner_planner })
  planner_planner: planner_planner;
}
