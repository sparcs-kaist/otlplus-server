import { django_content_type } from './django_content_type';
import { auth_user } from './auth_user';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class django_admin_log {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Date })
  action_time: Date;

  @ApiPropertyOptional({ type: String })
  object_id?: string;

  @ApiProperty({ type: String })
  object_repr: string;

  @ApiProperty({ type: Number })
  action_flag: number;

  @ApiProperty({ type: String })
  change_message: string;

  @ApiPropertyOptional({ type: Number })
  content_type_id?: number;

  @ApiProperty({ type: Number })
  user_id: number;

  @ApiPropertyOptional({ type: () => django_content_type })
  django_content_type?: django_content_type;

  @ApiProperty({ type: () => auth_user })
  auth_user: auth_user;
}
