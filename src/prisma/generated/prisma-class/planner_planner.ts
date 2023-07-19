import { planner_arbitraryplanneritem } from './planner_arbitraryplanneritem';
import { planner_futureplanneritem } from './planner_futureplanneritem';
import { graduation_generaltrack } from './graduation_generaltrack';
import { graduation_majortrack } from './graduation_majortrack';
import { session_userprofile } from './session_userprofile';
import { planner_planner_additional_tracks } from './planner_planner_additional_tracks';
import { planner_takenplanneritem } from './planner_takenplanneritem';
import { ApiProperty } from '@nestjs/swagger';

export class planner_planner {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  start_year: number;

  @ApiProperty({ type: Number })
  end_year: number;

  @ApiProperty({ type: Number })
  arrange_order: number;

  @ApiProperty({ type: Number })
  general_track_id: number;

  @ApiProperty({ type: Number })
  major_track_id: number;

  @ApiProperty({ type: Number })
  user_id: number;

  @ApiProperty({ isArray: true, type: () => planner_arbitraryplanneritem })
  planner_arbitraryplanneritem: planner_arbitraryplanneritem[];

  @ApiProperty({ isArray: true, type: () => planner_futureplanneritem })
  planner_futureplanneritem: planner_futureplanneritem[];

  @ApiProperty({ type: () => graduation_generaltrack })
  graduation_generaltrack: graduation_generaltrack;

  @ApiProperty({ type: () => graduation_majortrack })
  graduation_majortrack: graduation_majortrack;

  @ApiProperty({ type: () => session_userprofile })
  session_userprofile: session_userprofile;

  @ApiProperty({ isArray: true, type: () => planner_planner_additional_tracks })
  planner_planner_additional_tracks: planner_planner_additional_tracks[];

  @ApiProperty({ isArray: true, type: () => planner_takenplanneritem })
  planner_takenplanneritem: planner_takenplanneritem[];
}
