import { session_userprofile } from './session_userprofile';
import { subject_department } from './subject_department';
import { ApiProperty } from '@nestjs/swagger';

export class session_userprofile_specialized_major {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  userprofile_id: number;

  @ApiProperty({ type: Number })
  department_id: number;

  @ApiProperty({ type: () => session_userprofile })
  session_userprofile: session_userprofile;

  @ApiProperty({ type: () => subject_department })
  subject_department: subject_department;
}
