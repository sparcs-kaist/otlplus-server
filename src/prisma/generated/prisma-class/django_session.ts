import { ApiProperty } from '@nestjs/swagger';

export class django_session {
  @ApiProperty({ type: String })
  session_key: string;

  @ApiProperty({ type: String })
  session_data: string;

  @ApiProperty({ type: Date })
  expire_date: Date;
}
