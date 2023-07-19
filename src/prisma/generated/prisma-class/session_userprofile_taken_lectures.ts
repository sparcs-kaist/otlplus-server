import { ApiProperty } from '@nestjs/swagger';

export class session_userprofile_taken_lectures {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  userprofile_id: number;

  @ApiProperty({ type: Number })
  lecture_id: number;
}
