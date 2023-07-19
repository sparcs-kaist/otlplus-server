import { subject_course } from './subject_course';
import { session_userprofile } from './session_userprofile';
import { ApiProperty } from '@nestjs/swagger';

export class main_relatedcoursedailyuserfeed {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Date })
  date: Date;

  @ApiProperty({ type: Number })
  priority: number;

  @ApiProperty({ type: Number })
  course_id: number;

  @ApiProperty({ type: Number })
  user_id: number;

  @ApiProperty({ type: Boolean })
  visible: boolean;

  @ApiProperty({ type: () => subject_course })
  subject_course: subject_course;

  @ApiProperty({ type: () => session_userprofile })
  session_userprofile: session_userprofile;
}
