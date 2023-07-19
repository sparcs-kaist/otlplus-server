import { graduation_additionaltrack } from './graduation_additionaltrack';
import { graduation_majortrack } from './graduation_majortrack';
import { main_famousmajorreviewdailyfeed } from './main_famousmajorreviewdailyfeed';
import { planner_arbitraryplanneritem } from './planner_arbitraryplanneritem';
import { session_userprofile_majors } from './session_userprofile_majors';
import { session_userprofile_minors } from './session_userprofile_minors';
import { session_userprofile_specialized_major } from './session_userprofile_specialized_major';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class subject_department {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String })
  num_id: string;

  @ApiProperty({ type: String })
  code: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiPropertyOptional({ type: String })
  name_en?: string;

  @ApiProperty({ type: Boolean })
  visible: boolean;

  @ApiProperty({ isArray: true, type: () => graduation_additionaltrack })
  graduation_additionaltrack: graduation_additionaltrack[];

  @ApiProperty({ isArray: true, type: () => graduation_majortrack })
  graduation_majortrack: graduation_majortrack[];

  @ApiProperty({ isArray: true, type: () => main_famousmajorreviewdailyfeed })
  main_famousmajorreviewdailyfeed: main_famousmajorreviewdailyfeed[];

  @ApiProperty({ isArray: true, type: () => planner_arbitraryplanneritem })
  planner_arbitraryplanneritem: planner_arbitraryplanneritem[];

  @ApiProperty({ isArray: true, type: () => session_userprofile_majors })
  session_userprofile_majors: session_userprofile_majors[];

  @ApiProperty({ isArray: true, type: () => session_userprofile_minors })
  session_userprofile_minors: session_userprofile_minors[];

  @ApiProperty({
    isArray: true,
    type: () => session_userprofile_specialized_major,
  })
  session_userprofile_specialized_major: session_userprofile_specialized_major[];
}
