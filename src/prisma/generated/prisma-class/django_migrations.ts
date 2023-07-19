import { ApiProperty } from '@nestjs/swagger';

export class django_migrations {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String })
  app: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: Date })
  applied: Date;
}
