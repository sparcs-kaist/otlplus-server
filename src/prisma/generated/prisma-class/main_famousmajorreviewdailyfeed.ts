import { subject_department } from './subject_department';
import { main_famousmajorreviewdailyfeed_reviews } from './main_famousmajorreviewdailyfeed_reviews';
import { ApiProperty } from '@nestjs/swagger';

export class main_famousmajorreviewdailyfeed {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Date })
  date: Date;

  @ApiProperty({ type: Number })
  priority: number;

  @ApiProperty({ type: Number })
  department_id: number;

  @ApiProperty({ type: Boolean })
  visible: boolean;

  @ApiProperty({ type: () => subject_department })
  subject_department: subject_department;

  @ApiProperty({
    isArray: true,
    type: () => main_famousmajorreviewdailyfeed_reviews,
  })
  main_famousmajorreviewdailyfeed_reviews: main_famousmajorreviewdailyfeed_reviews[];
}
