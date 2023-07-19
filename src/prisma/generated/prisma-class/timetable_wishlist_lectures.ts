import { subject_lecture } from './subject_lecture';
import { timetable_wishlist } from './timetable_wishlist';
import { ApiProperty } from '@nestjs/swagger';

export class timetable_wishlist_lectures {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  wishlist_id: number;

  @ApiProperty({ type: Number })
  lecture_id: number;

  @ApiProperty({ type: () => subject_lecture })
  subject_lecture: subject_lecture;

  @ApiProperty({ type: () => timetable_wishlist })
  timetable_wishlist: timetable_wishlist;
}
