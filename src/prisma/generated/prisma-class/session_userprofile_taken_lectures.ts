import { subject_lecture } from './subject_lecture';
import { session_userprofile } from './session_userprofile';
import { ApiProperty } from '@nestjs/swagger';

export class session_userprofile_taken_lectures {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  userprofile_id: number;

  @ApiProperty({ type: Number })
  lecture_id: number;

  @ApiProperty({ type: () => subject_lecture })
  lecture: subject_lecture;

  @ApiProperty({ type: () => session_userprofile })
  userprofile: session_userprofile;
}
