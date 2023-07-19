import { auth_group_permissions } from './auth_group_permissions';
import { auth_user_groups } from './auth_user_groups';
import { ApiProperty } from '@nestjs/swagger';

export class auth_group {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ isArray: true, type: () => auth_group_permissions })
  auth_group_permissions: auth_group_permissions[];

  @ApiProperty({ isArray: true, type: () => auth_user_groups })
  auth_user_groups: auth_user_groups[];
}
