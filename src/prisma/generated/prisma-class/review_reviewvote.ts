import { review_review } from './review_review';
import { session_userprofile } from './session_userprofile';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class review_reviewvote {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  review_id: number;

  @ApiProperty({ type: () => review_review })
  review: review_review;

  @ApiPropertyOptional({ type: Number })
  userprofile_id?: number;

  @ApiPropertyOptional({ type: () => session_userprofile })
  userprofile?: session_userprofile;

  @ApiPropertyOptional({ type: Date })
  created_datetime?: Date;
}
