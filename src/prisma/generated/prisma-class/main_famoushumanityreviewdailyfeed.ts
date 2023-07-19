import { main_famoushumanityreviewdailyfeed_reviews } from './main_famoushumanityreviewdailyfeed_reviews';
import { ApiProperty } from '@nestjs/swagger';

export class main_famoushumanityreviewdailyfeed {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Date })
  date: Date;

  @ApiProperty({ type: Number })
  priority: number;

  @ApiProperty({ type: Boolean })
  visible: boolean;

  @ApiProperty({
    isArray: true,
    type: () => main_famoushumanityreviewdailyfeed_reviews,
  })
  main_famoushumanityreviewdailyfeed_reviews: main_famoushumanityreviewdailyfeed_reviews[];
}
