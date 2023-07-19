import { session_userprofile } from './session_userprofile';
import { ApiProperty } from '@nestjs/swagger';

export class main_ratedailyuserfeed {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Date })
  date: Date;

  @ApiProperty({ type: Number })
  priority: number;

  @ApiProperty({ type: Boolean })
  visible: boolean;

  @ApiProperty({ type: Number })
  user_id: number;

  @ApiProperty({ type: () => session_userprofile })
  session_userprofile: session_userprofile;
}
