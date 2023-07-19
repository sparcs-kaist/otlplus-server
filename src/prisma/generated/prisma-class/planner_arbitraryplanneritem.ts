import { subject_department } from './subject_department';
import { planner_planner } from './planner_planner';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class planner_arbitraryplanneritem {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Boolean })
  is_excluded: boolean;

  @ApiProperty({ type: Number })
  year: number;

  @ApiProperty({ type: Number })
  semester: number;

  @ApiProperty({ type: String })
  type: string;

  @ApiProperty({ type: String })
  type_en: string;

  @ApiProperty({ type: Number })
  credit: number;

  @ApiProperty({ type: Number })
  credit_au: number;

  @ApiPropertyOptional({ type: Number })
  department_id?: number;

  @ApiProperty({ type: Number })
  planner_id: number;

  @ApiPropertyOptional({ type: () => subject_department })
  subject_department?: subject_department;

  @ApiProperty({ type: () => planner_planner })
  planner_planner: planner_planner;
}
