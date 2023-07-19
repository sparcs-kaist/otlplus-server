import { ApiProperty } from '@nestjs/swagger';

export class session_userprofile_favorite_departments {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  userprofile_id: number;

  @ApiProperty({ type: Number })
  department_id: number;
}
