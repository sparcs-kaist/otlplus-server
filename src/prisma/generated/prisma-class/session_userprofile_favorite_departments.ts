import { subject_department } from './subject_department';
import { session_userprofile } from './session_userprofile';
import { ApiProperty } from '@nestjs/swagger';

export class session_userprofile_favorite_departments {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  userprofile_id: number;

  @ApiProperty({ type: Number })
  department_id: number;

  @ApiProperty({ type: () => subject_department })
  department: subject_department;

  @ApiProperty({ type: () => session_userprofile })
  userprofile: session_userprofile;
}
