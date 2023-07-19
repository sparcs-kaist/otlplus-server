import { main_famoushumanityreviewdailyfeed } from './main_famoushumanityreviewdailyfeed';
import { review_review } from './review_review';
import { ApiProperty } from '@nestjs/swagger';

export class main_famoushumanityreviewdailyfeed_reviews {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  famoushumanityreviewdailyfeed_id: number;

  @ApiProperty({ type: Number })
  review_id: number;

  @ApiProperty({ type: () => main_famoushumanityreviewdailyfeed })
  main_famoushumanityreviewdailyfeed: main_famoushumanityreviewdailyfeed;

  @ApiProperty({ type: () => review_review })
  review_review: review_review;
}
