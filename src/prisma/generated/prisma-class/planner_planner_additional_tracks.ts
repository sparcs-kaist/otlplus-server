import { graduation_additionaltrack } from './graduation_additionaltrack';
import { planner_planner } from './planner_planner';
import { ApiProperty } from '@nestjs/swagger';

export class planner_planner_additional_tracks {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  planner_id: number;

  @ApiProperty({ type: Number })
  additionaltrack_id: number;

  @ApiProperty({ type: () => graduation_additionaltrack })
  graduation_additionaltrack: graduation_additionaltrack;

  @ApiProperty({ type: () => planner_planner })
  planner_planner: planner_planner;
}
