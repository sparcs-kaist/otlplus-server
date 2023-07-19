import { auth_permission } from './auth_permission';
import { auth_group } from './auth_group';
import { ApiProperty } from '@nestjs/swagger';

export class auth_group_permissions {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  group_id: number;

  @ApiProperty({ type: Number })
  permission_id: number;

  @ApiProperty({ type: () => auth_permission })
  auth_permission: auth_permission;

  @ApiProperty({ type: () => auth_group })
  auth_group: auth_group;
}
