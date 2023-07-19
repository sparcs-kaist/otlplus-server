import { auth_user_groups } from './auth_user_groups';
import { auth_user_user_permissions } from './auth_user_user_permissions';
import { django_admin_log } from './django_admin_log';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class auth_user {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String })
  password: string;

  @ApiPropertyOptional({ type: Date })
  last_login?: Date;

  @ApiProperty({ type: Boolean })
  is_superuser: boolean;

  @ApiProperty({ type: String })
  username: string;

  @ApiProperty({ type: String })
  first_name: string;

  @ApiProperty({ type: String })
  last_name: string;

  @ApiProperty({ type: String })
  email: string;

  @ApiProperty({ type: Boolean })
  is_staff: boolean;

  @ApiProperty({ type: Boolean })
  is_active: boolean;

  @ApiProperty({ type: Date })
  date_joined: Date;

  @ApiProperty({ isArray: true, type: () => auth_user_groups })
  auth_user_groups: auth_user_groups[];

  @ApiProperty({ isArray: true, type: () => auth_user_user_permissions })
  auth_user_user_permissions: auth_user_user_permissions[];

  @ApiProperty({ isArray: true, type: () => django_admin_log })
  django_admin_log: django_admin_log[];
}
