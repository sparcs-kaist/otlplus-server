import { subject_lecture } from './subject_lecture';
import { main_famoushumanityreviewdailyfeed_reviews } from './main_famoushumanityreviewdailyfeed_reviews';
import { main_famousmajorreviewdailyfeed_reviews } from './main_famousmajorreviewdailyfeed_reviews';
import { session_userprofile } from './session_userprofile';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class review_review {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  course_id: number;

  @ApiProperty({ type: Number })
  lecture_id: number;

  @ApiProperty({ type: () => subject_lecture })
  lecture: subject_lecture;

  @ApiProperty({ type: String })
  content: string;

  @ApiProperty({ type: Number })
  grade: number;

  @ApiProperty({ type: Number })
  load: number;

  @ApiProperty({ type: Number })
  speech: number;

  @ApiPropertyOptional({ type: Number })
  writer_id?: number;

  @ApiProperty({ type: String })
  writer_label: string;

  @ApiProperty({ type: Date })
  updated_datetime: Date;

  @ApiProperty({ type: Number })
  like: number;

  @ApiProperty({ type: Number })
  is_deleted: number;

  @ApiPropertyOptional({ type: Date })
  written_datetime?: Date;

  @ApiProperty({
    isArray: true,
    type: () => main_famoushumanityreviewdailyfeed_reviews,
  })
  main_famoushumanityreviewdailyfeed_reviews: main_famoushumanityreviewdailyfeed_reviews[];

  @ApiProperty({
    isArray: true,
    type: () => main_famousmajorreviewdailyfeed_reviews,
  })
  main_famousmajorreviewdailyfeed_reviews: main_famousmajorreviewdailyfeed_reviews[];

  @ApiPropertyOptional({ type: () => session_userprofile })
  writer?: session_userprofile;
}
