import { subject_department } from './subject_department';
import { planner_planner_additional_tracks } from './planner_planner_additional_tracks';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class graduation_additionaltrack {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  start_year: number;

  @ApiProperty({ type: Number })
  end_year: number;

  @ApiProperty({ type: String })
  type: string;

  @ApiProperty({ type: Number })
  major_required: number;

  @ApiProperty({ type: Number })
  major_elective: number;

  @ApiPropertyOptional({ type: Number })
  department_id?: number;

  @ApiPropertyOptional({ type: () => subject_department })
  subject_department?: subject_department;

  @ApiProperty({ isArray: true, type: () => planner_planner_additional_tracks })
  planner_planner_additional_tracks: planner_planner_additional_tracks[];
}
