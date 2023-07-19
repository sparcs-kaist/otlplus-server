import { session_userprofile } from './session_userprofile';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class support_rate {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  score: number;

  @ApiProperty({ type: Number })
  year: number;

  @ApiPropertyOptional({ type: Date })
  created_datetime?: Date;

  @ApiProperty({ type: Number })
  user_id: number;

  @ApiProperty({ type: String })
  version: string;

  @ApiProperty({ type: () => session_userprofile })
  session_userprofile: session_userprofile;
}
