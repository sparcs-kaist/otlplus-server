import { subject_department } from './subject_department';
import { planner_planner } from './planner_planner';
import { ApiProperty } from '@nestjs/swagger';

export class graduation_majortrack {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  start_year: number;

  @ApiProperty({ type: Number })
  end_year: number;

  @ApiProperty({ type: Number })
  basic_elective_doublemajor: number;

  @ApiProperty({ type: Number })
  major_required: number;

  @ApiProperty({ type: Number })
  major_elective: number;

  @ApiProperty({ type: Number })
  department_id: number;

  @ApiProperty({ type: () => subject_department })
  subject_department: subject_department;

  @ApiProperty({ isArray: true, type: () => planner_planner })
  planner_planner: planner_planner[];
}
