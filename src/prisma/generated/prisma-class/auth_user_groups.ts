import { auth_group } from './auth_group';
import { auth_user } from './auth_user';
import { ApiProperty } from '@nestjs/swagger';

export class auth_user_groups {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  user_id: number;

  @ApiProperty({ type: Number })
  group_id: number;

  @ApiProperty({ type: () => auth_group })
  auth_group: auth_group;

  @ApiProperty({ type: () => auth_user })
  auth_user: auth_user;
}
