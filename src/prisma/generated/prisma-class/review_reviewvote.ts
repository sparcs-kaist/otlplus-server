import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class review_reviewvote {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  review_id: number;

  @ApiPropertyOptional({ type: Number })
  userprofile_id?: number;

  @ApiPropertyOptional({ type: Date })
  created_datetime?: Date;
}
