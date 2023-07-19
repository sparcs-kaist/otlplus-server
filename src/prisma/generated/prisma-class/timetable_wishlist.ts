import { session_userprofile } from './session_userprofile';
import { timetable_wishlist_lectures } from './timetable_wishlist_lectures';
import { ApiProperty } from '@nestjs/swagger';

export class timetable_wishlist {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  user_id: number;

  @ApiProperty({ type: () => session_userprofile })
  session_userprofile: session_userprofile;

  @ApiProperty({ isArray: true, type: () => timetable_wishlist_lectures })
  timetable_wishlist_lectures: timetable_wishlist_lectures[];
}
