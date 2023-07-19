import { subject_lecture } from './subject_lecture';
import { session_userprofile } from './session_userprofile';
import { ApiProperty } from '@nestjs/swagger';

export class main_reviewwritedailyuserfeed {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Date })
  date: Date;

  @ApiProperty({ type: Number })
  priority: number;

  @ApiProperty({ type: Number })
  lecture_id: number;

  @ApiProperty({ type: Number })
  user_id: number;

  @ApiProperty({ type: Boolean })
  visible: boolean;

  @ApiProperty({ type: () => subject_lecture })
  subject_lecture: subject_lecture;

  @ApiProperty({ type: () => session_userprofile })
  session_userprofile: session_userprofile;
}
