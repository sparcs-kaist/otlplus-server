import { planner_planner } from './planner_planner';
import { ApiProperty } from '@nestjs/swagger';

export class graduation_generaltrack {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  start_year: number;

  @ApiProperty({ type: Number })
  end_year: number;

  @ApiProperty({ type: Boolean })
  is_foreign: boolean;

  @ApiProperty({ type: Number })
  total_credit: number;

  @ApiProperty({ type: Number })
  total_au: number;

  @ApiProperty({ type: Number })
  basic_required: number;

  @ApiProperty({ type: Number })
  basic_elective: number;

  @ApiProperty({ type: Number })
  thesis_study: number;

  @ApiProperty({ type: Number })
  thesis_study_doublemajor: number;

  @ApiProperty({ type: Number })
  general_required_credit: number;

  @ApiProperty({ type: Number })
  general_required_au: number;

  @ApiProperty({ type: Number })
  humanities: number;

  @ApiProperty({ type: Number })
  humanities_doublemajor: number;

  @ApiProperty({ isArray: true, type: () => planner_planner })
  planner_planner: planner_planner[];
}
