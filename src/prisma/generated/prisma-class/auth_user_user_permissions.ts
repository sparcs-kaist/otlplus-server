import { auth_permission } from './auth_permission';
import { auth_user } from './auth_user';
import { ApiProperty } from '@nestjs/swagger';

export class auth_user_user_permissions {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  user_id: number;

  @ApiProperty({ type: Number })
  permission_id: number;

  @ApiProperty({ type: () => auth_permission })
  auth_permission: auth_permission;

  @ApiProperty({ type: () => auth_user })
  auth_user: auth_user;
}
