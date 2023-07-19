import { subject_course } from './subject_course';
import { session_userprofile } from './session_userprofile';
import { ApiProperty } from '@nestjs/swagger';

export class subject_courseuser {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Date })
  latest_read_datetime: Date;

  @ApiProperty({ type: Number })
  course_id: number;

  @ApiProperty({ type: Number })
  user_profile_id: number;

  @ApiProperty({ type: () => subject_course })
  subject_course: subject_course;

  @ApiProperty({ type: () => session_userprofile })
  session_userprofile: session_userprofile;
}
