import { main_famousmajorreviewdailyfeed } from './main_famousmajorreviewdailyfeed';
import { review_review } from './review_review';
import { ApiProperty } from '@nestjs/swagger';

export class main_famousmajorreviewdailyfeed_reviews {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  famousmajorreviewdailyfeed_id: number;

  @ApiProperty({ type: Number })
  review_id: number;

  @ApiProperty({ type: () => main_famousmajorreviewdailyfeed })
  main_famousmajorreviewdailyfeed: main_famousmajorreviewdailyfeed;

  @ApiProperty({ type: () => review_review })
  review_review: review_review;
}
