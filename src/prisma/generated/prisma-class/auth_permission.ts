import { auth_group_permissions } from './auth_group_permissions';
import { django_content_type } from './django_content_type';
import { auth_user_user_permissions } from './auth_user_user_permissions';
import { ApiProperty } from '@nestjs/swagger';

export class auth_permission {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: Number })
  content_type_id: number;

  @ApiProperty({ type: String })
  codename: string;

  @ApiProperty({ isArray: true, type: () => auth_group_permissions })
  auth_group_permissions: auth_group_permissions[];

  @ApiProperty({ type: () => django_content_type })
  django_content_type: django_content_type;

  @ApiProperty({ isArray: true, type: () => auth_user_user_permissions })
  auth_user_user_permissions: auth_user_user_permissions[];
}
