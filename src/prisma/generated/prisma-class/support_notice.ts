import { ApiProperty } from '@nestjs/swagger';

export class support_notice {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Date })
  start_time: Date;

  @ApiProperty({ type: Date })
  end_time: Date;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: String })
  content: string;
}
